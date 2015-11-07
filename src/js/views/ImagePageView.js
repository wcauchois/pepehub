var React = require('react'),
    _ = require('lodash'),
    ApiServices = require('../ApiServices'),
    SimpleTags = require('./SimpleTags');

var TagsControl = React.createClass({
  getInitialState: function() {
    return {
      tags: (this.props.tags || []),
      addTagContent: ''
    };
  },

  addTagChanged: function(event) {
    this.setState({addTagContent: event.target.value.replace(/[^a-zA-Z0-9_]/g, '_')});
  },

  addTagKeyDown: function(event) {
    if (event.keyCode === 13) {
      this.doAddTag();
    }
  },

  doAddTag: function() {
    ApiServices.addTag(this.props.imageId, this.state.addTagContent).then(function(response) {
      this.setState({tags: response.tags, addTagContent: ''});
    }.bind(this));
  },

  removeTag: function(tag) {
    ApiServices.removeTag(this.props.imageId, tag).then(function(response) {
      this.setState({tags: response.tags});
    }.bind(this));
    return false;
  },

  render: function() {
    return (
      <div className="tagsControl">
        <SimpleTags removeTag={this.removeTag} tags={this.state.tags} />
        <input type="text" placeholder="Add a tag" value={this.state.addTagContent}
          className="addTagInput" onChange={this.addTagChanged} onKeyDown={this.addTagKeyDown} />
      </div>
    );
  }
});

var ImagePageView = React.createClass({
  render: function() {
    return (
      <div className="imagePage">
        <h3>Ultra Rare</h3>
        <img className="detailImage" src={this.props.image.image_url} />
        <TagsControl tags={this.props.image.tags} imageId={this.props.image.id} />
      </div>
    );
  }
});

module.exports = ImagePageView;

