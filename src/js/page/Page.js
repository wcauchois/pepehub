var Promise = require('bluebird'),
    Base = require('basejs');

// Remember to require() your pages in app.js!!
var Page = Base.extend({
  constructor: function(route) {
  },

  load: function() {
    return Promise.resolve({});
  },

  createComponent: function(data) {
    throw new Error("Must override createComponent!");
  }
});

module.exports = Page;

