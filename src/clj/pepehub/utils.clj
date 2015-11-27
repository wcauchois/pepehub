(ns pepehub.utils
  (:require [clojure.java.io :as io]))

(defn load-resource [n]
  (slurp (io/resource n)))

(defn print-error [& args]
  ; http://stackoverflow.com/a/22020982
  (binding [*out* *err*]
    (apply println args)))

(defn append-to-file-name [name to-add]
  (let [index-of-period (.lastIndexOf name ".")
        before-period (.substring name 0 index-of-period)
        after-period (.substring name index-of-period (.length name))]
    (str before-period to-add after-period)))
