var director = require('director'),
    Base = require('basejs'),
    _ = require('lodash'),
    ReactDOM = require('react-dom');

var PageRouter = Base.extend({
  constructor: function() {
    this.router = new director.Router();
  },

  register: function(route, pageClass) {
    this.router.on(route, function() {
      // http://stackoverflow.com/q/5054926
      var args = [pageClass, route].concat(_.toArray(arguments));
      var page = new (pageClass.bind.apply(pageClass, args));
      page.load().then(function(data) {
        this.renderPage(page, data);
      }.bind(this));
    }.bind(this));
  },

  renderPage: function(page, data) {
    ReactDOM.render(
      page.createComponent(data),
      document.getElementById('render')
    );
  },

  init: function(initialRoute) {
    this.router.init(initialRoute);
  }
});

module.exports = new PageRouter();
