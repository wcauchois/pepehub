var Page = require('./Page'),
    PageRouter = require('./PageRouter'),
    ApiServices = require('../ApiServices'),
    React = require('react'),
    ImagePageView = require('../views/ImagePageView');

var ImagePage = Page.extend({
  constructor: function(route, id) {
    this.id = id;
  },

  load: function() {
    return ApiServices.getImage(this.id);
  },

  createComponent: function(response) {
    return <ImagePageView image={response.image} />;
  }
});

PageRouter.register('/image/:id', ImagePage);

module.exports = ImagePage;
