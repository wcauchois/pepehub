var PageRouter = require('./page/PageRouter');

require('./page/HomePage');
require('./page/ImagePage');
require('./page/TagPage');
require('./page/PopularTagsPage');
require('./page/TaggingGamePage');

global['startApp'] = function(options) {
  PageRouter.init('/', options);
};
