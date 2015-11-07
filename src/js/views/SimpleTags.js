var React = require('react'),
    _ = require('lodash');

var SimpleTags = React.createClass({
  removeTag: function(tag, event) {
    this.props.removeTag && this.props.removeTag(tag);
  },

  render: function() {
    var tagElements = [];
    _.each(this.props.tags || [], function(tag) {
      tagElements.push(
        <div className="tagContainer" key={tag}>
          <span className="tag">
            <a href={'#/tag/' + tag}>
              {tag}
            </a>
          </span>
          <span className="removeTag" onClick={this.removeTag.bind(this, tag)}>
            {String.fromCharCode(215)}
          </span>
        </div>
      );
    }, this);

    return <div>{tagElements}</div>;
  }
});

module.exports = SimpleTags;

