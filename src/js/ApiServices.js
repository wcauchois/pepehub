var Promise = require('bluebird');

function postJSON(url, params) {
  return Promise.resolve($.ajax({
    type: "POST",
    url: url,
    data: params,
    dataType: 'json'
  }));
}

module.exports = {
  getImages: function(params) {
    return Promise.resolve($.getJSON('/get_images.json', (params || {})));
  },

  getImage: function(id) {
    return Promise.resolve($.getJSON('/get_image.json', {id: id}));
  },

  addTag: function(id, tag) {
    return postJSON('/add_tag.json', {id: id, tag: tag});
  },

  removeTag: function(id, tag) {
    return Promise.resolve($.getJSON('/remove_tag.json', {id: id, tag: tag}));
  },

  getSignedRequest: function(params) {
    return postJSON('/sign_s3', params);
  },

  addImage: function(params) {
    return postJSON('/add_image.json', params);
  },

  deleteImage: function(id) {
    return postJSON('/delete_image.json', {id: id});
  }
};
