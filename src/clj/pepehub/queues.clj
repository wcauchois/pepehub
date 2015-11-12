(ns pepehub.queues
  (:require [environ.core :refer [env]]))

(def default-exchange-name "")

(def queue-registry
  {:refresh-tags "pepehub.refresh-tags"})

(def amqp-url (env :cloudamqp-url))
