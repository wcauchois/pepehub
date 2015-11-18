(ns pepehub.core
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.route :as route]
            [stencil.core :refer [render-file]]
            [clojure.data.json :as json]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.keyword-params :refer [wrap-keyword-params]]
            [ring.middleware.session :refer [wrap-session]]
            [ring.middleware.session.store :refer [SessionStore]]
            [ring.middleware.stacktrace :refer [wrap-stacktrace]]
            [ring.util.response :refer :all]
            [monger.core :as mg]
            [monger.query :as mq]
            [monger.operators :refer :all]
            [stencil.loader]
            [clojure.java.io :as io]
            [monger.collection :as mc]
            [ring.adapter.jetty :as jetty]

            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]

            [pepehub.queues :as q]

            [environ.core :refer [env]])
  (:import org.bson.types.ObjectId))

(def mongo-conn (atom nil))
(def mongo-db (atom nil))
(def rmq-ch (atom nil))

(defn home [req]
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body (render-file "templates/home" {})})

(defn convert-id [doc]
  (dissoc (assoc doc :id (.toString (:_id doc))) :_id))

(defn render-image [doc]
  (let [suffix (:suffix doc)
        s3-prefix (str "https://" (env :s3-assets-bucket) ".s3.amazonaws.com/")]
    (convert-id (assoc doc
                       :image_url (str s3-prefix "img/" suffix)
                       :thumbnail_url (str s3-prefix "thumb/150/" suffix)))))

(defn integer-param
  ([req name] (integer-param req name nil))
  ([req name default-value]
   (let [value (get-in req [:params name])]
     (if value (Integer/parseInt value) default-value))))

(defn json-response [data & [status]]
  {:status (or status 200)
   :headers {"Content-Type" "application/json"}
   :body (json/write-str data)})

(defn get-images [req]
  (let [limit (min 100 (integer-param req :limit 20))
        offset (integer-param req :offset 0)
        tag-filter (get-in req [:params :tag])
        criteria (if tag-filter {:tags tag-filter} {})
        images (map render-image
                    (mq/with-collection @mongo-db "images"
                      (mq/find criteria)
                      (mq/sort (sorted-map :_id -1))
                      (mq/limit limit)
                      (mq/skip offset)))]
    (json-response {"images" images})))

(defn find-image [id]
  (mc/find-one-as-map @mongo-db "images" {:_id id}))

(defn get-image [req]
  (let [id (ObjectId. (get-in req [:params :id]))]
    (json-response
     {"image"
      (render-image (find-image id))})))

; XXX unused anymore?
(comment
  (defn return-tags [id]
    (json-response {"tags"
                    (or
                     (:tags (mq/with-collection @mongo-db "images"
                              (mq/find {:_id id})
                              (mq/fields [:tags])))
                     [])})))

(defn enqueue-refresh-tags []
  (lb/publish @rmq-ch q/default-exchange-name q/refresh-tags-qname
              (pr-str {}) {:content-type "application/edn"}))

(defmacro tag-modifier [oper]
  `(fn [req#]
     (let [id# (ObjectId. (get-in req# [:params :id]))
           updated-doc#
           (mc/find-and-modify @mongo-db "images" {:_id id#}
                               {~oper {:tags (get-in req# [:params :tag])}} {:return-new true})]
       (enqueue-refresh-tags)
       (json-response {"tags" (or (:tags updated-doc#) [])}))))

(def add-tag (tag-modifier $addToSet))
(def remove-tag (tag-modifier $pull))

(defn generate-new-random-key []
  (str (java.util.UUID/randomUUID)))

(deftype MongoSessionStore [db]
  SessionStore
  (read-session [store key]
    (mc/find-one-as-map (.db store) "sessions" {:_id key}))
  (write-session [store key data]
    (let [key (or key (generate-new-random-key))]
      (mc/insert (.db store) "sessions" (assoc data :_id key))
      key))
  (delete-session [store key]
    (mc/remove (.db store) "sessions" {:_id key})
    nil))

(defn admin-login [req]
  (let [login-successful
        (= (get-in req [:params :pw]) (env :admin-password))]
    {:status (if login-successful 200 400)
     :headers {"Content-Type" "text/plain"}
     :session (if login-successful {:admin true} nil)
     :body (if login-successful
             "logged in as admin"
             "wrong password")}))

(defn require-admin [handler]
  (fn [req]
    (if (get-in req [:session :admin])
      (handler req)
      (json-response {"message" "access denied"} 403))))

(defn delete-image [req]
  (let [id (ObjectId. (get-in req [:params :id]))]
    (mc/remove @mongo-db "images" {:_id id})
    (json-response {"result" "OK"})))

(def dev-mode? (= (env :lein-env) "development"))

(defn bundle-version [] (-> "build/bundle.js.hash" io/resource slurp .trim))

(defn get-bundle [req]
  (let [current-version (bundle-version)
        headers (:headers req)
        requested-version (get headers "if-none-match")
        no-cache
        (or (.contains (-> headers (get "cache-control" "") .toLowerCase) "no-cache")
            (.equalsIgnoreCase (get headers "pragma" "") "no-cache"))
        response-headers {"ETag" current-version
                          "Content-Type" "text/javascript"}]
    (if (and (= current-version requested-version) (not no-cache))
      {:status 304 :headers response-headers :body ""}
      {:status 200 :headers response-headers
       :body (slurp (io/resource "build/bundle.js"))})))

(defroutes app
  (GET "/" req (home req))
  (GET "/get_images.json" req (get-images req))
  (GET "/get_image.json" req (get-image req))
  (GET "/add_tag.json" req (add-tag req))
  (GET "/remove_tag.json" req (remove-tag req))
  (POST "/delete_image.json" req ((require-admin delete-image) req))
  (GET "/admin_login" req (admin-login req))
  (GET "/bundle.js" req (get-bundle req))
  (route/resources "/")
  (ANY "*" []
    (route/not-found (slurp (io/resource "404.html")))))

(defn site [routes session-store]
  (defn with-opts [routes middleware opts] (middleware routes opts))
  (defn optionally [routes b middleware & [opts]]
    (if b
      (if opts (middleware routes opts) (middleware routes))
      routes))
  (-> routes
      wrap-keyword-params
      wrap-params
      (with-opts wrap-session {:store session-store})
      (optionally dev-mode? wrap-stacktrace)))

(defn -main [& [port]]
  (stencil.loader/set-cache (clojure.core.cache/ttl-cache-factory {} :ttl 0))
  (let [{:keys [conn db]} (mg/connect-via-uri (env :mongolab-uri))]
    (reset! mongo-conn conn)
    (reset! mongo-db db))
  (let [{:keys [ch]} (q/connect-and-install-shutdown-hook)]
    (reset! rmq-ch ch))
  (let [port (Integer. (or port (env :port) 5000))
        session-store (MongoSessionStore. @mongo-db)]
    (jetty/run-jetty (site app session-store) {:port port :join? false})))

; For interactive development:
; (.stop server)
; (def server (-main))
