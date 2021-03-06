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
    var pageComponent = page.createComponent(data, this.options);
    ReactDOM.render(
      <ChromeView pageComponent={pageComponent} router={this}
        canUpload={this.options.canUpload}
        showTaggingGame={this.options.showTaggingGame}
        key={Math.random().toString()} />,
      document.getElementById('render')
    );
  },

  init: function(initialRoute, options) {
    this.options = options;
    this.router.init(initialRoute);
  },

  navigate: function(newRoute) {
    if (newRoute.charAt(0) === '/') {
      newRoute = newRoute.substring(1);
    }
    var needReload = _.isEqual(this.router.getRoute(), newRoute.split('/'));
    this.router.setRoute(newRoute);
    if (needReload) {
      // Force a reload
      this.router.dispatch('on', newRoute);
    }
  }
});

module.exports = new PageRouter();
