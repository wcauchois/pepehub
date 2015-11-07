(ns pepehub.core
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.handler :refer [site]]
            [compojure.route :as route]
            [stencil.core :refer [render-file]]
            [clojure.data.json :as json]
            [monger.core :as mg]
            [monger.query :as q]
            [stencil.loader]
            [clojure.java.io :as io]
            [monger.collection :as mc]
            [ring.adapter.jetty :as jetty]
            [environ.core :refer [env]]))

(def *mongo-conn* (atom nil))
(def *mongo-db* (atom nil))

(defn home []
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

(defn get-images [req]
  (let [limit (min 100 (integer-param req :limit 20))
        offset (integer-param req :offset 0)
        images (map render-image
                    (q/with-collection @*mongo-db* "images"
                      (q/find {})
                      (q/sort (sorted-map :_id -1))
                      (q/limit limit)
                      (q/skip offset)))]
    {:status 200
     :headers {"Content-Type" "application/json"}
     :body (json/write-str {"images" images})}))

(defroutes app
  (GET "/" [] (home))
  (GET "/get_images.json" req (get-images req))
  (route/resources "/")
  (ANY "*" []
    (route/not-found (slurp (io/resource "404.html")))))

(defn -main [& [port]]
  (stencil.loader/set-cache (clojure.core.cache/ttl-cache-factory {} :ttl 0))
  (let [{:keys [conn db]} (mg/connect-via-uri (env :mongolab-uri))]
    (reset! *mongo-conn* conn)
    (reset! *mongo-db* db))
  (let [port (Integer. (or port (env :port) 5000))]
    (jetty/run-jetty (site #'app) {:port port :join? false})))

; For interactive development:
; (.stop server)
; (def server (-main))
