var React = require('react'),
    _ = require('lodash'),
    PagedGallery = require('./PagedGallery');

var BigTag = React.createClass({
  render: function() {
    return (
      <span className="bigTag">
        <span className="icon" />
        {this.props.name}
      </span>
    );
  }
});

var TagPageView = React.createClass({
  render: function() {
    return (
      <div className="tagPage">
        <div className="header">
          <h3>
            <BigTag name={this.props.tag} />
            (page {this.props.pageNumber} of {this.props.totalPages})
            <a href="#/" className="button goBackButton">Go back</a>
          </h3>
        </div>
        {React.createElement(PagedGallery, _.extend({
          pathPrefix: 'tag/' + this.props.tag + '/'
        }, this.props))}
      </div>
    );
  }
});

module.exports = TagPageView;
