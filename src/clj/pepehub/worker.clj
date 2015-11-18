(ns pepehub.worker
  (:require [monger.core :as mg]
            [monger.query :as mq]
            [monger.operators :refer :all]
            [monger.collection :as mc]

            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]

            [clojure.edn :as edn]

            [pepehub.queues :as q]

            [environ.core :refer [env]]))

(defn refresh-tags-handler
  [ch {:keys [content-type delivery-tag] :as meta} ^bytes payload]
  (let [parsed-payload (edn/read-string (String. payload "UTF-8"))]
    (println (format "[consumer] Received a message: %s, delivery tag: %d, content type: %s"
                     parsed-payload delivery-tag content-type))))

(defn -main [& args]
  (let [{:keys [conn ch]} (q/connect-and-install-shutdown-hook)]
    (lq/declare ch "pepehub.refresh-tags" {:exclusive false :auto-delete true})
    (lc/subscribe ch "pepehub.refresh-tags" refresh-tags-handler {:auto-ack true})
    (println "[consumer] Started listening")))
