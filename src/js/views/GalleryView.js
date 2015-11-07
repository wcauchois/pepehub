var React = require('react'),
    _ = require('lodash'),
    SimpleTags = require('./SimpleTags');

var GalleryThumb = React.createClass({
  render: function() {
    return (
      <div className="galleryThumb">
        <a href={'#/image/' + this.props.image.id}>
          <img src={this.props.image.thumbnail_url} />
        </a>
        <div className="tagsControl noRemoval">
          <SimpleTags tags={this.props.image.tags || []} />
        </div>
      </div>
    );
  }
});

var GalleryView = React.createClass({
  render: function() {
    var thumbs = _.map(this.props.images, function(image) {
      return <GalleryThumb image={image} key={image.id} />;
    });

    return (
      <div className="gallery">
        {thumbs}
      </div>
    );
  }
});

module.exports = GalleryView;

