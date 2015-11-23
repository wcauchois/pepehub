(ns pepehub.s3
  (:require [environ.core :refer [env]]
            [clj-time.core :as t]
            [clojure.string :as str]
            [clj-time.coerce :as coerce])
  (:import com.amazonaws.services.s3.AmazonS3Client
           com.amazonaws.ClientConfiguration
           com.amazonaws.HttpMethod
           com.amazonaws.services.s3.model.GeneratePresignedUrlRequest
           com.amazonaws.auth.BasicAWSCredentials))

; Reference: https://github.com/weavejester/clj-aws-s3/blob/master/src/aws/sdk/s3.clj

(def s3-client
  (delay
   (let [client-configuration (ClientConfiguration.)
         aws-creds (BasicAWSCredentials. (env :aws-access-key-id) (env :aws-secret-access-key))]
     (AmazonS3Client. aws-creds client-configuration))))

(defn http-method [method]
  (-> method name str/upper-case HttpMethod/valueOf))

(defn generate-presigned-url [key content-type method & [options]]
  (let [req (GeneratePresignedUrlRequest.
             (env :s3-bucket-name) key (http-method method))]
    (doto req
      (.withExpiration (coerce/to-date (-> 1 t/days t/from-now)))
      (.withContentType content-type))
    (doseq [[k v] options] (.addRequestParameter req k v))
    (.toString (.generatePresignedUrl @s3-client req))))
