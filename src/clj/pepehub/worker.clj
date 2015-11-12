(ns pepehub.worker
  (:require [monger.core :as mg]
            [monger.query :as q]
            [monger.operators :refer :all]
            [monger.collection :as mc]

            [langohr.core      :as rmq]
            [langohr.channel   :as lch]
            [langohr.queue     :as lq]
            [langohr.consumers :as lc]
            [langohr.basic     :as lb]

            [pepehub.queues :refer :all]

            [environ.core :refer [env]]))

(defn message-handler
  [ch {:keys [content-type delivery-tag] :as meta} ^bytes payload]
  (println (format "[consumer] Received a message: %s, delivery tag: %d, content type: %s"
                   (String. payload "UTF-8") delivery-tag content-type)))

(defn -main [& args]
  (let [conn (rmq/connect {:uri amqp-url})
        ch (lch/open conn)]
    (lq/declare ch "pepehub.refresh-tags" {:exclusive false :auto-delete true})
    (lc/subscribe ch "pepehub.refresh-tags" message-handler {:auto-ack true})
    (println "[consumer] Started listening")
    (.addShutdownHook (Runtime/getRuntime) (Thread. #(do (rmq/close ch) (rmq/close conn))))))
