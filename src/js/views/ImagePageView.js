var React = require('react'),
    _ = require('lodash'),
    PageRouter = require('../page/PageRouter'),
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
  deleteImage: function() {
    if (window.confirm("Are you sure?")) {
      ApiServices.deleteImage(this.props.image.id).then(function() {
        PageRouter.navigate('/');
      });
    }
  },

  render: function() {
    var deleteButton;
    if (this.props.canDelete) {
      deleteButton = (
        <div className="adminSection">
          <div className="button danger" onClick={this.deleteImage}>Delete image</div>
        </div>
      );
    }
    return (
      <div className="imagePage">
        <div className="header">
          <h3>
            Ultra Rare
          </h3>
        </div>
        <img className="detailImage" src={this.props.image.image_url} />
        <TagsControl tags={this.props.image.tags} imageId={this.props.image.id} />
        {deleteButton}
      </div>
    );
  }
});

module.exports = ImagePageView;

