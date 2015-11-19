(ns pepehub.mongo
  (:require [monger.core :as mg]
            [environ.core :refer [env]]))

(def mongo-conn (atom nil))
(def mongo-db (atom nil))

(defn connect-mongo! []
  (let [{:keys [conn db]} (mg/connect-via-uri (env :mongolab-uri))]
    (reset! mongo-conn conn)
    (reset! mongo-db db)))
