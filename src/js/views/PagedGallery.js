var React = require('react'),
    _ = require('lodash'),
    GalleryView = require('./GalleryView'),
    classNames = require('classnames');

var PagedGallery = React.createClass({
  canGoBackwards: function() {
    return this.props.pageNumber > 1;
  },

  canGoForwards: function() {
    return (typeof this.props.totalPages === 'undefined') || (this.props.pageNumber < this.props.totalPages);
  },

  clickHandler: function(enabledFn) {
    return function(event) {
      if (!enabledFn()) {
        event.preventDefault();
      }
    };
  },

  prevPageClicked: function(event) {
    if (!this.canGoBackwards()) {
      event.preventDefault();
    }
  },

  navLink: function(delta) {
    return '#/' + (this.props.pathPrefix || '') + 'page/' + (this.props.pageNumber + delta);
  },

  buttonClass: function(enabled) {
    return classNames({'button': true, 'disabled': !enabled});
  },

  render: function() {
    return (
      <div className="pagedGallery">
        <div>
          <GalleryView images={this.props.images} />
        </div>
        <div className="pageButtons">
          <a href={this.navLink(-1)}
            className={this.buttonClass(this.canGoBackwards())}
            onClick={this.clickHandler(this.canGoBackwards)}>Previous page</a>
          <a href={this.navLink(1)}
            className={this.buttonClass(this.canGoForwards())}
            onClick={this.clickHandler(this.canGoForwards)}>Next page</a>
        </div>
      </div>
    );
  }
});

module.exports = PagedGallery;
