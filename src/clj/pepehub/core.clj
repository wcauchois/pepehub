(ns pepehub.core
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.route :as route]
            [stencil.loader]
            [clojure.java.io :as io]
            [clojure.data.json :as json]
            [clojure.string :as str]
            [stencil.core :refer [render-file]]

            [monger.core :as mg]
            [monger.query :as mq]
            [monger.operators :refer :all]
            [monger.collection :as mc]

            [ring.adapter.jetty :as jetty]
            [ring.middleware.params :refer [wrap-params]]
            [ring.middleware.keyword-params :refer [wrap-keyword-params]]
            [ring.middleware.session :refer [wrap-session]]
            [ring.middleware.session.store :refer [SessionStore]]
            [ring.middleware.stacktrace :refer [wrap-stacktrace]]
            [ring.util.response :refer :all]

            [langohr.basic     :as lb]

            [pepehub.aws :as aws]
            [pepehub.queues :as q]
            [pepehub.utils :refer :all]
            [pepehub.mongo :refer :all]
            [pepehub.runtime-config :as config]

            [environ.core :refer [env]])
  (:import org.bson.types.ObjectId))

(def rmq-ch (atom nil))

(defn can-upload-images? [] (config/get "allowImageUpload" true))

(defn home [req]
  (let [is-admin? (get-in req [:session :admin])
        page-options
        {"admin" (or is-admin? false)
         "canUpload" (can-upload-images?)}]
    {:status 200
     :headers {"Content-Type" "text/html"}
     :body (render-file "templates/home" {:options (json/write-str page-options)})}))

(defn convert-id [doc]
  (dissoc (assoc doc :id (.toString (:_id doc))) :_id))

(def s3-prefix (str "https://" (env :s3-bucket-name) ".s3.amazonaws.com/"))

(defn render-image [doc]
  (let [suffix (:suffix doc)]
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
  "For the session store"
  (str (java.util.UUID/randomUUID)))

(deftype MongoSessionStore [db]
  SessionStore
  (read-session [store key]
    (mc/find-one-as-map (.db store) "sessions" {:_id key}))
  (write-session [store key data]
    (let [key (or key (generate-new-random-key))]
      (mc/update (.db store) "sessions" {:_id key} data {:upsert true})
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

(defn dev-mode? [] (= (env :lein-env) "development"))

(defn bundle-version [] (-> "build/bundle.js.hash" load-resource .trim))

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
       :body (load-resource "build/bundle.js")})))

; Based on https://github.com/lift/framework/blob/master/core/util/src/main/scala/net/liftweb/util/HttpHelpers.scala#L105
(defn append-params [url params]
  (let [url-sep (if (.contains url "?") "&" "?")
        enc #(java.net.URLEncoder/encode % "utf-8")]
    (str url url-sep
         (str/join "&" (map (fn [[k v]] (format "%s=%s" (enc k) (enc v))) params)))))

(defn sign-s3 [req]
  (when-not (can-upload-images?)
    (throw (Exception. "Uploading images is not allowed")))
  (let [file-name (get-in req [:params :file_name])
        s3-key
        (or (aws/get-unique-filename (str "img/" file-name) (aws/generate-default-suffixes))
            (throw (Exception. "Could not create unique file name for image")))
        unique-file-name (.substring s3-key (.length "img/"))
        file-type (get-in req [:params :file_type])
        _ (when-not (#{"image/jpg" "image/jpeg" "image/png"} file-type)
            (throw (Exception. "Unsupported file type")))
        signing-opts {"x-amz-acl" "public-read"}]
    (json-response
     {"url"
      (aws/generate-presigned-url s3-key file-type :put signing-opts)
      "suffix" unique-file-name
      "thumbnail_url" (str s3-prefix "thumb/150/" unique-file-name)})))

(defn add-image [req]
  (let [suffix (get-in req [:params :suffix])
        doc (mc/insert-and-return @mongo-db "images" {:suffix suffix})]
    (json-response (render-image doc))))

(defroutes app
  (GET "/" req (home req))
  ; TODO: Come up with better ordering for routes
  (GET "/get_images.json" req (get-images req))
  (GET "/get_image.json" req (get-image req))
  (GET "/remove_tag.json" req (remove-tag req))
  (GET "/admin_login" req (admin-login req))
  (GET "/bundle.js" req (get-bundle req))
  (POST "/sign_s3" req (sign-s3 req))
  (POST "/add_image.json" req (add-image req))
  (POST "/add_tag.json" req (add-tag req))
  (POST "/delete_image.json" req ((require-admin delete-image) req))

  (GET "/test_config" req (do
                            (config/get "testBooleanValue" true)
                            (config/get "testIntegerValue" 42)
                            (json-response {"test-value" (config/get "testValue" "hello")})))
  (ANY "/edit_config" req ((require-admin #(config/admin-page "/edit_config" %)) req))

  (route/resources "/")
  (ANY "*" []
    (route/not-found (load-resource "404.html"))))

(defn site [routes session-store]
  (defn with-opts [routes middleware opts] (middleware routes opts))
  (defn optionally [routes b middleware & [opts]]
    (if b
      (if opts (middleware routes opts) (middleware routes))
      routes))
  (-> routes
      wrap-keyword-params
      wrap-params
      config/middleware
      (with-opts wrap-session {:store session-store})
      (optionally (dev-mode?) wrap-stacktrace)))

(defn -main [& [port]]
  (stencil.loader/set-cache (clojure.core.cache/ttl-cache-factory {} :ttl 0))
  (connect-mongo!)
  (config/start-refresher-thread!)
  (let [{:keys [ch]} (q/connect-and-install-shutdown-hook)]
    (reset! rmq-ch ch))
  (let [port (Integer. (or port (env :port) 5000))
        session-store (MongoSessionStore. @mongo-db)]
    (jetty/run-jetty (site app session-store) {:port port :join? false})))

; For interactive development:
; (.stop server)
; (def server (-main))
