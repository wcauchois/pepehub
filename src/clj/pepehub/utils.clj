(ns pepehub.utils
  (:require [clojure.java.io :as io]))

(defn load-resource [n]
  (slurp (io/resource n)))

(defn print-error [& args]
  ; http://stackoverflow.com/a/22020982
  (binding [*out* *err*]
    (apply println args)))
