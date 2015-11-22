(ns pepehub.admin-util.gen-env
  (:require [clojure.edn :as edn]
            [clojure.string :as str])
  (:import [java.io PushbackReader FileReader PrintWriter]))

(defn edn-from-file [filename]
  (let [file-reader (FileReader. filename)]
    (try
      (let [pushback-reader (PushbackReader. file-reader)]
        (read pushback-reader))
      (finally (.close file-reader)))))

(defn environmentalize [s]
  "Convert a keyword like :mongolab-uri into an environment variable name like MONGOLAB_URI"
  (-> (name s) str/upper-case (str/replace "-" "_")))

(defn -main [& args]
  (let [profiles-edn (edn-from-file "profiles.clj")
        dev-config (get-in profiles-edn [:dev :env])
        converted-env (into {} (for [[k v] dev-config] [(environmentalize k) v]))
        pw (PrintWriter. ".env")]
    (try
      (doseq [[k v] converted-env] (.println pw (format "%s=%s" k v)))
      (println "Converted profiles.clj into .env file for `heroku local`.")
      (finally (.close pw)))))
