var React = require('react'),
    _ = require('lodash'),
    GalleryView = require('./GalleryView');

var PagedGallery = React.createClass({
  canGoBackwards: function() {
    return this.props.pageNumber > 1;
  },

  prevPageClicked: function() {
    if (!this.canGoBackwards()) {
      return false;
    }
  },

  navLink: function(delta) {
    return '#/' + (this.props.pathPrefix || '') + 'page/' + (this.props.pageNumber + delta);
  },

  render: function() {
    var prevPageClass = 'button' + (!this.canGoBackwards() ? ' disabled' : '');
    return (
      <div className="pagedGallery">
        <div>
          <GalleryView images={this.props.images} />
        </div>
        <div>
          <a href={this.navLink(-1)} className={prevPageClass} onClick={this.prevPageClicked}>Previous page</a>
          <a href={this.navLink(1)} className="button">Next page</a>
        </div>
      </div>
    );
  }
});

module.exports = PagedGallery;
