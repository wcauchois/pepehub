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

; Based on https://github.com/lift/framework/blob/master/core/util/src/main/scala/net/liftweb/util/HttpHelpers.scala#L105
(defn append-params [url params]
  (let [url-sep (if (.contains url "?") "&" "?")
        enc #(java.net.URLEncoder/encode % "utf-8")]
    (str url url-sep
         (str/join "&" (map (fn [[k v]] (format "%s=%s" (enc k) (enc v))) params)))))
