var React = require('react'),
    _ = require('lodash'),
    PagedGallery = require('./PagedGallery');

var HomePageView = React.createClass({
  render: function() {
    return (
      <div>
        <div className="header">
          <h3>Page {this.props.pageNumber} of ???</h3>
        </div>
        <PagedGallery
          images={this.props.images}
          pageNumber={this.props.pageNumber} />
      </div>
    );
  }
});

module.exports = HomePageView;
