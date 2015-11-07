var Page = require('./Page'),
    PageRouter = require('./PageRouter'),
    ApiServices = require('../ApiServices'),
    React = require('react'),
    HomePageView = require('../views/HomePageView');

var PAGE_SIZE = 20;

var HomePage = Page.extend({
  constructor: function(route, pageNumber) {
    if (route === '/') {
      this.pageNumber = 0;
    } else {
      this.pageNumber = parseInt(pageNumber);
    }
  },

  load: function() {
    return ApiServices.getImages({
      offset: this.pageNumber * PAGE_SIZE,
      limit: PAGE_SIZE
    });
  },

  createComponent: function(response) {
    return <HomePageView images={response.images} pageNumber={this.pageNumber} />;
  }
});

PageRouter.register('/', HomePage);
PageRouter.register('/page/:pageNumber', HomePage);

module.exports = HomePage;
