(ns pepehub.worker
  (:require [monger.core :as mg]
            [monger.collection :as mc]

            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]

            [clojure.edn :as edn]

            [pepehub.queues :as q]
            [pepehub.utils :refer :all]
            [pepehub.mongo :refer :all]

            [environ.core :refer [env]])
  (:import [com.mongodb MapReduceCommand$OutputType]))

(defn refresh-tags-handler
  [ch {:keys [content-type delivery-tag] :as meta} ^bytes payload]
  (let
   [parsed-payload (edn/read-string (String. payload "UTF-8"))
    _ (println (format "[consumer] Received a message: %s, delivery tag: %d, content type: %s"
                       parsed-payload delivery-tag content-type))
    output (mc/map-reduce @mongo-db "images"
                          (load-resource "mr/map-popular-tags.js")
                          (load-resource "mr/reduce-popular-tags.js")
                          "popular_tags"
                          MapReduceCommand$OutputType/REPLACE {})]
    nil))

(defn -main [& args]
  (let [{:keys [conn ch]} (q/connect-and-install-shutdown-hook)]
    (lq/declare ch "pepehub.refresh-tags" {:exclusive false :auto-delete true})
    (lc/subscribe ch "pepehub.refresh-tags" refresh-tags-handler {:auto-ack true})
    (connect-mongo!)
    (println "[consumer] Started listening")))
