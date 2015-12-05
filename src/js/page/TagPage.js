var BaseGalleryPage = require('./BaseGalleryPage'),
    PageRouter = require('./PageRouter'),
    TagPageView = require('../views/TagPageView');

var TagPage = BaseGalleryPage.extend({
  constructor: function(route, tag, pageNumber) {
    this.base(route, pageNumber);
    this.tag = tag;
  },

  getExtraCriteria: function() {
    return {tag: this.tag};
  },

  getView: function() {
    return TagPageView;
  },

  getViewOptions: function() {
    return {tag: this.tag};
  }
});

PageRouter.register('/tag/:tag', TagPage);
PageRouter.register('/tag/:tag/page/:pageNumber', TagPage);

module.exports = TagPage;
