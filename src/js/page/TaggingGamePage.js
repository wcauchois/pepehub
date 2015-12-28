var TaggingGamePageView = require('../views/TaggingGamePageView'),
    Page = require('./Page'), 
    React = require('react'),
    PageRouter = require('./PageRouter');

var TaggingGamePage = Page.extend({
  createComponent: function(response) {
    return <TaggingGamePageView />
  }
});

PageRouter.register('/tagging_game', TaggingGamePage);

module.exports = TaggingGamePage;
