var Page = require('./Page'),
    ApiServices = require('../ApiServices'),
    _ = require('lodash'),
    React = require('react');

var DEFAULT_PAGE_SIZE = 20;

var BaseGalleryPage = Page.extend({
  constructor: function(route, pageNumber) {
    if (typeof pageNumber !== 'undefined') {
      this.pageNumber = parseInt(pageNumber);
    } else {
      this.pageNumber = 1;
    }
  },

  getPageSize: function() {
    return DEFAULT_PAGE_SIZE;
  },

  getExtraCriteria: function() {
    return {};
  },

  load: function() {
    var pageSize = this.getPageSize();
    return ApiServices.getImages(_.extend({
      offset: (this.pageNumber - 1) * pageSize,
      limit: pageSize
    }, this.getExtraCriteria()));
  },

  getView: function() {
    throw new Error("Not implemented");
  },

  getViewOptions: function() {
    return {};
  },

  createComponent: function(response) {
    return React.createElement(
      this.getView(),
      _.extend({
        images: response.images,
        totalCount: response.total_count,
        totalPages: Math.ceil(response.total_count / this.getPageSize()),
        pageNumber: this.pageNumber
      }, this.getViewOptions())
    );
  }
});

module.exports = BaseGalleryPage;
