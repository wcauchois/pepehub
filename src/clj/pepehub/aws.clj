(ns pepehub.aws
  (:require [environ.core :refer [env]]
            [clj-time.core :as t]
            [clojure.string :as str]
            [pepehub.utils :refer :all]
            [clj-time.coerce :as coerce])
  (:import com.amazonaws.services.s3.AmazonS3Client
           com.amazonaws.ClientConfiguration
           com.amazonaws.HttpMethod
           com.amazonaws.services.s3.model.GeneratePresignedUrlRequest
           com.amazonaws.services.s3.model.AmazonS3Exception
           com.amazonaws.auth.BasicAWSCredentials))

; Reference: https://github.com/weavejester/clj-aws-s3/blob/master/src/aws/sdk/s3.clj

(def s3-client
  (delay
   (let [client-configuration (ClientConfiguration.)
         aws-creds (BasicAWSCredentials. (env :aws-access-key-id) (env :aws-secret-access-key))]
     (AmazonS3Client. aws-creds client-configuration))))

(defn http-method [method]
  (-> method name str/upper-case HttpMethod/valueOf))

(def bucket-name (env :s3-bucket-name))

(defn generate-presigned-url [key content-type method & [options]]
  (let [req (GeneratePresignedUrlRequest.
             bucket-name key (http-method method))]
    (doto req
      (.withExpiration (coerce/to-date (-> 1 t/days t/from-now)))
      (.withContentType content-type))
    (doseq [[k v] options] (.addRequestParameter req k v))
    (.toString (.generatePresignedUrl @s3-client req))))

(defn generate-default-suffixes []
  "Generate a vector of suffixes suitable for use with get-unique-filename.
  Unimaginitive '-1' '-2' etc are tried, with the last resort a random
  hexadecimal number"
  ["-1" "-2" (format "-%06x" (rand-int 0xffffff))])

(defn s3-object-exists? [key]
  (try
    (.getObject @s3-client bucket-name key)
    true
    (catch AmazonS3Exception e
      (if (= (.getStatusCode e) 404)
        false
        (throw e)))))

(defn get-unique-filename [original-key suffixes-to-try]
  "Tries appending a series of suffixes to a filename in order to
  ensure it is unique within the S3 bucket"
  (loop [[suffix & rest-of-suffixes] (cons "" suffixes-to-try)]
    (let [new-file-name (append-to-file-name original-key suffix)]
      (if (s3-object-exists? new-file-name)
        (if (empty? rest-of-suffixes)
          nil
          (recur rest-of-suffixes))
        new-file-name))))
