(ns pepehub.queues
  (:require [environ.core :refer [env]]

            [langohr.core      :as rmq]
            [langohr.channel   :as lch]))

(def ^{:const true} default-exchange-name "")

(def refresh-tags-qname "pepehub.refresh-tags")

(def amqp-url (env :cloudamqp-url))

(defn connect-and-install-shutdown-hook []
  (let [conn (rmq/connect {:uri amqp-url})
        ch (lch/open conn)]
    (.addShutdownHook (Runtime/getRuntime) (Thread. #(do (rmq/close ch) (rmq/close conn))))
    {:conn conn :ch ch}))
