(defproject pepehub "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :dependencies [[org.clojure/clojure "1.7.0"]
                 [environ "1.0.1"]
                 [ring/ring-jetty-adapter "1.4.0"]
                 [ring/ring-core "1.4.0"]
                 [compojure "1.4.0"]]
  :uberjar-name "pepehub-standalone.jar"
  :plugins [[lein-environ "1.0.1"]]
  :profiles {:production {:env {:production true}}})
