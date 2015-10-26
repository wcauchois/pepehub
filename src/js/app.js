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

function getPageState() {
  return {images: GalleryStore.getAll()};
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

  render: function() {
    var imageElements = _.map(this.state.images, function(image) {
      return (
        <div className="image" key={image.id}>
          <img src={image.thumbnail_url} />
        </div>
      );
    });
    return (
      <div>
        {imageElements}
      </div>
    );
  }
});

global.renderPage = function(el) {
  ReactDOM.render(
    <HomePage />,
    el
  );

  Promise.resolve($.getJSON('/get_images.json')).then(function(response) {
    AppDispatcher.dispatch({
      actionType: GalleryConstants.IMAGES_UPDATED,
      images: response.images
    });
  });
};

