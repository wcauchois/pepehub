(ns pepehub.admin-util.backfill-random
  (:require [monger.core :as mg]
            [clojure.java.io :as io]
            [monger.query :as mq]
            [monger.operators :refer :all]
            [monger.collection :as mc]))

; Usage:
; MONGOLAB_URI=mongodb://localhost/pepehub lein trampoline run -m pepehub.admin-util.backfill-random

(defn -main [& args]
  (let [{:keys [conn db]} (mg/connect-via-uri (System/getenv "MONGOLAB_URI"))
        documents-missing-random 
        (mq/with-collection db "images"
          (mq/find {:random {$exists false}}))]
    (println (format "Found %d documents missing :random" (count documents-missing-random)))
    (doseq [doc documents-missing-random]
      (mc/update-by-id db "images" (:_id doc) {$set {:random (rand)}}))))
