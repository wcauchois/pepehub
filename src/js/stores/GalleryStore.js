var EventEmitter = require('events').EventEmitter,
    AppDispatcher = require('../dispatcher/AppDispatcher'),
    _ = require('lodash'),
    GalleryConstants = require('../constants/GalleryConstants');

var _items = [];
var CHANGE_EVENT = 'change';

var GalleryStore = _.extend({}, EventEmitter.prototype, {
  getAll: function() {
    return _items;
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
});

AppDispatcher.register(function(action) {
  switch(action.actionType) {
    case GalleryConstants.IMAGES_UPDATED:
      _items = action.images;
      GalleryStore.emitChange();
      break;
  }
});

module.exports = GalleryStore;
