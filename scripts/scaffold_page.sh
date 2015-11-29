#!/bin/bash

if [ $# -lt 1 ]; then
  cat <<EOF
usage: $0 {PageName}Page
  example: $0 HomePage
  creates page/HomePage.js and views/HomePageView.js
  NOTE: definitely commit your changes before running this script
EOF
  exit 1
fi

if (echo $1 | grep Page) >/dev/null; then
  true # do nothing
else
  echo "you probably want to have your page name end with 'Page'"
  echo "exiting."
  exit 1
fi

if [ -e src/js/page/${1}.js -o -e src/js/views/{$1}View.js ]; then
  echo "looks like this page already exists"
  echo "exiting."
  exit 1
fi

cat >src/js/page/${1}.js <<EOF
var Page = require('./Page'),
    PageRouter = require('./PageRouter'),
    ApiServices = require('../ApiServices'),
    React = require('react'),
    ${1}View = require('../views/${1}View');

var $1 = Page.extend({
  constructor: function(route) {
  },

  load: function() {
    return ApiServices.TODO();
  },

  createComponent: function(response) {
    return <${1}View />;
  }
});

PageRouter.register('/TODO', $1);

module.exports = $1;
EOF
echo "created src/js/page/${1}.js"

cat >src/js/views/${1}View.js <<EOF
var React = require('react'),
    _ = require('lodash');

var ${1}View = React.createClass({
  render: function() {
    return (
      <div>
      </div>
    );
  }
});

module.exports = ${1}View;
EOF
echo "created src/js/views/${1}View.js"

# this is pretty janky, may want to disable
rewrite_app_js=yes

if [ "$rewrite_app_js" = "yes" ]; then
  IFS=''
  fname=$(mktemp)
  while read line; do
    if (echo $line | egrep '^require') >/dev/null; then
      found_require=yes
    else
      if [ -n "$found_require" -a -z "$required_new_page" ]; then
        echo "require(new thing)"
        required_new_page=yes
      fi
    fi
    echo "$line"
  done <src/js/app.js >$fname
  mv $fname src/js/app.js
  echo "rewrote app.js to require new page"
fi

echo "done."
