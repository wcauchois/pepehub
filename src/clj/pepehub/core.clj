(ns pepehub.core
  (:require [compojure.core :refer [defroutes GET PUT POST DELETE ANY]]
            [compojure.handler :refer [site]]
            [compojure.route :as route]
            [stencil.core :refer [render-file]]
            [stencil.loader]
            [clojure.java.io :as io]
            [ring.adapter.jetty :as jetty]
            [environ.core :refer [env]]))

(defn home []
  {:status 200
   :headers {"Content-Type" "text/html"}
   :body (render-file "templates/home" {})})

(defroutes app
  (GET "/" [] (home))
  (route/resources "/")
  (ANY "*" []
    (route/not-found (slurp (io/resource "404.html")))))

(defn -main [& [port]]
  (stencil.loader/set-cache (clojure.core.cache/ttl-cache-factory {} :ttl 0))
  (println "hello from core!!" (.toString (env :mongolab-uri)))
  (let [port (Integer. (or port (env :port) 5000))]
    (jetty/run-jetty (site #'app) {:port port :join? false})))

; For interactive development:
; (.stop server)
; (def server (-main))
