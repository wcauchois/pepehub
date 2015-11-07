var React = require('react'),
    _ = require('lodash'),
    GalleryView = require('./GalleryView');

var HomePageView = React.createClass({
  canGoBackwards: function() {
    return this.props.pageNumber > 0;
  },

  prevPageClicked: function() {
    if (!this.canGoBackwards()) {
      return false;
    }
  },

  navLink: function(delta) {
    return '#/page/' + (this.props.pageNumber + delta);
  },

  render: function() {
    var prevPageClass = 'button' + (!this.canGoBackwards() ? ' disabled' : '');
    return (
      <div className="container">
        <div className="header">
          <h3>Page {this.props.pageNumber} of ???</h3>
        </div>
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

module.exports = HomePageView;
