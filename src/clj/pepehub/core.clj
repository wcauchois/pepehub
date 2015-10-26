(ns pepehub.core
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.handler :refer [site]]
            [compojure.route :as route]
            [stencil.core :refer [render-file]]
            [clojure.data.json :as json]
            [monger.core :as mg]
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

(defn get-images [request]
  (let [images (map render-image (mc/find-maps @*mongo-db* "images"))]
    {:status 200
     :headers {"Content-Type" "application/json"}
     :body (json/write-str {"images" images})}))

(defroutes app
  (GET "/" [] (home))
  (GET "/get_images.json" request (get-images request))
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
