var React = require('react'),
    _ = require('lodash');

var SimpleTags = React.createClass({
  removeTag: function(tag) {
    this.props.removeTag && this.props.removeTag(tag);
    return false;
  },

  render: function() {
    var tagElements = [];
    _.each(this.props.tags || [], function(tag) {
      tagElements.push(
        <div className="tagContainer" key={tag}>
          <a href={'#/tag/' + tag}>
            <span className="tag">
              {tag}
            </span>
            <span className="removeTag" onClick={this.removeTag.bind(this, tag)}>
              {String.fromCharCode(215)}
            </span>
          </a>
        </div>
      );
    }, this);

    return <div>{tagElements}</div>;
  }
});

module.exports = SimpleTags;

