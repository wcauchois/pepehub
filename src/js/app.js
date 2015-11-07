var PageRouter = require('./page/PageRouter');

require('./page/HomePage');
require('./page/ImagePage');

global.startApp = function() {
  PageRouter.init('/');
};

