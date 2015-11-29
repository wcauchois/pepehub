var Page = require('./Page'),
    PageRouter = require('./PageRouter'),
    ApiServices = require('../ApiServices'),
    React = require('react'),
    PopularTagsPageView = require('../views/PopularTagsPageView');

var PopularTagsPage = Page.extend({
  constructor: function(route) {
  },

  load: function() {
    return ApiServices.popularTags();
  },

  createComponent: function(response) {
    return <PopularTagsPageView tags={response.tags} />;
  }
});

PageRouter.register('/popular_tags', PopularTagsPage);

module.exports = PopularTagsPage;
