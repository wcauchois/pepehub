var director = require('director'),
    Base = require('basejs'),
    _ = require('lodash'),
    ReactDOM = require('react-dom'),
    React = require('react'),
    ChromeView = require('../views/ChromeView');

var PageRouter = Base.extend({
  constructor: function() {
    this.router = new director.Router();
    this.options = {};
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
    var pageComponent = page.createComponent(data);
    ReactDOM.render(
      <ChromeView pageComponent={pageComponent} router={this} canUpload={this.options.canUpload} />,
      document.getElementById('render')
    );
  },

  init: function(initialRoute, options) {
    this.options = options;
    this.router.init(initialRoute);
  },

  navigate: function(newRoute) {
    this.router.setRoute(newRoute);
  }
});

module.exports = new PageRouter();
