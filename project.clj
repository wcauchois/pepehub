(defproject pepehub "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :source-paths ["src/clj"]
  :dependencies [[org.clojure/clojure "1.7.0"]
                 [environ "1.0.1"]
                 [ring/ring-jetty-adapter "1.4.0"]
                 [ring/ring-core "1.4.0"]
                 [ring/ring-devel "1.4.0"]
                 [com.novemberain/langohr "3.3.0"]
                 [stencil "0.5.0"]
                 [org.clojure/data.json "0.2.6"]
                 [com.novemberain/monger "3.0.0-rc2"]
                 [compojure "1.4.0"]]
  :uberjar-name "pepehub-standalone.jar"
  :plugins [[lein-environ "1.0.1"]]
  :min-lein-version "2.0.0"
  :main pepehub.core
  :env {:s3-assets-bucket "pepehub-assets"}
  :profiles {:production {:env {:production true}}
             :uberjar {:aot :all}})
