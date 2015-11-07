var Page = require('./Page'),
    PageRouter = require('./PageRouter'),
    ApiServices = require('../ApiServices'),
    React = require('react'),
    TagPageView = require('../views/TagPageView');

var PAGE_SIZE = 20;

var TagPage = Page.extend({
  constructor: function(route, tag, pageNumber) {
    this.tag = tag;
    this.pageNumber = pageNumber ? parseInt(pageNumber) : 0;
  },

  load: function() {
    return ApiServices.getImages({
      offset: this.pageNumber * PAGE_SIZE,
      limit: PAGE_SIZE,
      tag: this.tag
    });
  },

  createComponent: function(response) {
    return (
      <TagPageView tag={this.tag} images={response.images} pageNumber={this.pageNumber} />
    );
  }
});

PageRouter.register('/tag/:tag', TagPage);
PageRouter.register('/tag/:tag/page/:pageNumber', TagPage);

module.exports = TagPage;
