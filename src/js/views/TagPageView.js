var React = require('react'),
    _ = require('lodash'),
    PagedGallery = require('./PagedGallery');

var TagPageView = React.createClass({
  render: function() {
    return (
      <div>
        <div className="header">
          <h3>Tag: {this.props.tag} (page {this.props.pageNumber})
          {"\u00a0"}{"\u00a0"}
          <a href="#/" className="button">Go back</a>
          </h3>
        </div>
        <PagedGallery
          images={this.props.images}
          pathPrefix={'tag/' + this.props.tag + '/'}
          pageNumber={this.props.pageNumber} />
      </div>
    );
  }
});

module.exports = TagPageView;
