var React = require('react'),
    _ = require('lodash'),
    PagedGallery = require('./PagedGallery');

var HomePageView = React.createClass({
  render: function() {
    return (
      <div>
        <div className="header">
          <h3>Page {this.props.pageNumber} of {this.props.totalPages}</h3>
        </div>
        {React.createElement(PagedGallery, this.props)}
      </div>
    );
  }
});

module.exports = HomePageView;
