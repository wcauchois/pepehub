(ns pepehub.runtime-config
  "Implements a system for configuring the app at runtime. A configuration map is stored
  in a singleton Mongo record. The configuration is cached, and will be refreshed when pages
  load (via `middleware`), but at a max of once every `passive-refresh-interval` milliseconds.

  Use `(get key default)` to get the value of a config. Note the config will be typed as a
  boolean, string, or integer, depending on the value you pass for default.

  Also provides a simple web page for editing these configs."
  (:require [monger.core :as mg]
            [monger.collection :as mc]
            [stencil.core :refer [render-file]]
            [monger.operators :refer :all]
            [clojure.core.async :as a :refer [>! <! >!! <!! go chan buffer close! thread
                                              alts! alts!! timeout go-loop]]
            [monger.query :as mq]
            [ring.util.response :refer [redirect]]
            [pepehub.mongo :refer :all])
  (:refer-clojure :exclude [get]))

(defn fetch-config []
  (let [existing-doc (mc/find-one-as-map @mongo-db "config" {} {} false)]
    (or existing-doc
        (do
          ; Creates the record if it doesn't exist
          (mc/update @mongo-db "config" {} {} {:upsert true})
          {}))))

(def config-map (atom {}))

(defn type-string-for-value [value]
  (cond
    (string? value) "string"
    (integer? value) "int"
    (or (true? value) (false? value)) "bool"
    :else (throw (RuntimeException. "Unsupported type for runtime config"))))

(defn coerce-value-given-type [value type]
  (case type
    "string" value
    "int" (Integer/parseInt value)
    "bool" (Boolean/parseBoolean value)
    (throw (RuntimeException. (str "Unknown type: " type)))))

(defn get [key default]
  (let [current-config @config-map]
    (if (contains? current-config key)
      (get-in current-config [key "value"])
      (do
        (mc/update
         @mongo-db "config"
         {key {$exists false}}
         {$set {key {:value default
                     :type (type-string-for-value default)}}})
        default))))

(def refresh-chan (chan))

(def ^{:const true} active-refresh-interval 1000)

(def ^{:const true} passive-refresh-interval (* 1000 60))

(defn refresh-config! []
  (swap! config-map (fn [_] (dissoc (fetch-config) "_id"))))

(defn start-refresher-thread! []
  (refresh-config!)
  (thread
    (loop [last-refresh (System/currentTimeMillis)]
      (let [msg (<!! refresh-chan)
            now (System/currentTimeMillis)]
        (if (or (= msg :force) (> (- now last-refresh) active-refresh-interval))
          (do
            (refresh-config!)
            (recur now))
          (recur last-refresh)))))
  (go-loop []
    (Thread/sleep passive-refresh-interval)
    (>! refresh-chan :refresh)))

(defn maybe-refresh [] (go (>! refresh-chan :refresh)))

(defn force-refresh [] (go (>! refresh-chan :force)))

(defn admin-page [location-for-redirect req]
  (if (= (:request-method req) :post)
    (let [type (get-in req [:params :type])
          raw-value (get-in req [:params :value])
          config-name (get-in req [:params :name])
          new-value (coerce-value-given-type raw-value type)]
      (mc/update @mongo-db "config" {} {$set {(str config-name ".value") new-value}})
      {:status 303 :headers {"Location" location-for-redirect} :body ""})

    (let [current-config (refresh-config!)
          config-array (into [] (map (fn [[k v]]
                                       (assoc v "name" k (str (v "type") "?") true)) current-config))
          template-args {:config config-array}]
      {:status 200
       :headers {"Content-Type" "text/html"}
       :body (render-file "templates/edit_config" template-args)})))

(defn middleware [handler]
  (fn [req]
    (maybe-refresh)
    (handler req)))
