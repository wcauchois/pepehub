var _ = require('lodash'),
    Promise = require('bluebird'),
    Dispatcher = require('flux').Dispatcher,
    classNames = require('classnames'),
    React = require('react'),
    ReactDOM = require('react-dom'),
    AppDispatcher = require('./dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    GalleryConstants = require('./constants/GalleryConstants'),
    GalleryStore = require('./stores/GalleryStore');

var _pageNumber = 0;
function getPageState() {
  return {
    images: GalleryStore.getAll(),
    pageNumber: _pageNumber
  };
}

var HomePage = React.createClass({
  getInitialState: function() {
    return getPageState();
  },

  componentDidMount: function() {
    GalleryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function() {
    GalleryStore.removeChangeListener(this._onChange);
  },

  _onChange: function() {
    this.setState(getPageState());
  },

  onPageNext: function() {
    _pageNumber++;
    updateGallery();
    return false;
  },

  onPagePrev: function() {
    _pageNumber = Math.max(0, _pageNumber - 1);
    updateGallery();
    return false;
  },

  render: function() {
    var imageElements = _.map(this.state.images, function(image) {
      return (
        <div className="image" key={image.id}>
          <img src={image.thumbnail_url} />
        </div>
      );
    });
    return (
      <div className="container">
        <div>
          {imageElements}
        </div>
        <div>
          <a href="#" className="button" onClick={this.onPagePrev}>Previous page</a>
          <a href="#" className="button" onClick={this.onPageNext}>Next page</a>
        </div>
      </div>
    );
  }
});

var apiServices = {
  getImages: function(params) {
    return Promise.resolve($.getJSON('/get_images.json', (params || {})));
  }
};

var PAGE_SIZE = 40;
function updateGallery() {
  apiServices.getImages({
    offset: _pageNumber * PAGE_SIZE,
    limit: PAGE_SIZE
  }).then(function(response) {
    AppDispatcher.dispatch({
      actionType: GalleryConstants.IMAGES_UPDATED,
      images: response.images
    });
  });
}

global.renderPage = function(el) {
  ReactDOM.render(
    <HomePage />,
    el
  );
  updateGallery();
};

