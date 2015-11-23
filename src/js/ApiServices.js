var Promise = require('bluebird');

module.exports = {
  getImages: function(params) {
    return Promise.resolve($.getJSON('/get_images.json', (params || {})));
  },

  getImage: function(id) {
    return Promise.resolve($.getJSON('/get_image.json', {id: id}));
  },

  addTag: function(id, tag) {
    return Promise.resolve($.getJSON('/add_tag.json', {id: id, tag: tag}));
  },

  removeTag: function(id, tag) {
    return Promise.resolve($.getJSON('/remove_tag.json', {id: id, tag: tag}));
  },

  getSignedRequest: function(opts) {
    return Promise.resolve($.ajax({
      type: "POST",
      url: '/sign_s3',
      data: opts,
      dataType: 'json'
    }));
  }
};
