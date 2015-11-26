var PageRouter = require('./page/PageRouter');

require('./page/HomePage');
require('./page/ImagePage');
require('./page/TagPage');

global.startApp = function(options) {
  PageRouter.init('/', options);
};
