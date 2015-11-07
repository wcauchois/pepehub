(ns pepehub.admin-util.dataimport
  (:require [monger.core :as mg]
            [clojure.java.io :as io]
            [monger.collection :as mc]))

(defn dolog [& args]
  (apply println (cons "===>" args)))

; utility for importing data from text file -> database
; use like:
(comment
  (use 'pepehub.admin-util.dataimport :reload)
  (run-data-import "../pepe_images.txt" "mongodb://localhost/pepehub"))

(defn run-data-import [filename mongo-uri]
  (let [{:keys [conn db]} (mg/connect-via-uri mongo-uri)
        data-lines (with-open [rdr (io/reader filename)]
                     (doall (line-seq rdr)))
        imported-count (atom 0)]
    (doseq [line data-lines]
      (let [existing-doc (mc/find-one-as-map db "images" {"suffix" line})]
        (if existing-doc
          (dolog "Warning:" line "already exists with ID " (:_id existing-doc))
          (do
            (mc/insert db "images" {"suffix" line})
            (swap! imported-count #(+ 1 %))))))
    (dolog "Imported" @imported-count "images")
    (mg/disconnect conn)))
