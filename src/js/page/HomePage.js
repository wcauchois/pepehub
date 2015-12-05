var BaseGalleryPage = require('./BaseGalleryPage'),
    PageRouter = require('./PageRouter'),
    HomePageView = require('../views/HomePageView');

var HomePage = BaseGalleryPage.extend({
  getView: function() {
    return HomePageView;
  }
});

PageRouter.register('/', HomePage);
PageRouter.register('/page/:pageNumber', HomePage);

module.exports = HomePage;
