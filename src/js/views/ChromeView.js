var React = require('react'),
    _ = require('lodash'),
    classNames = require('classnames'),
    ApiServices = require('../ApiServices'),
    UploadModal = require('./UploadModal'),
    DropdownMenu = require('./DropdownMenu');

var ChromeView = React.createClass({
  getInitialState: function() {
    return {
      uploadModal: false
    };
  },

  uploadClicked: function(evt) {
    evt.preventDefault();
    this.setState({uploadModal: true});
  },

  uploadModalClosed: function() {
    this.setState({uploadModal: false});
  },

  randomImage: function(event) {
    event.preventDefault();
    ApiServices.randomImage().then(function(response) {
      this.props.router.navigate('/image/' + response.id);
    }.bind(this));
  },

  render: function() {
    var uploadModal;
    if (this.state.uploadModal) {
      uploadModal = <UploadModal onClose={this.uploadModalClosed} router={this.props.router} />
    }
    var uploadButton;
    if (this.props.canUpload) {
      uploadButton = (
        <div className="uploadButton">
          <span className="button" onClick={this.uploadClicked}>Upload</span>
        </div>
      );
    }
    var taggingGameButton;
    if (this.props.showTaggingGame) {
      var taggingGameEntries = [["Leaderboard", "#/leaderboard"]];
      taggingGameButton = (
        <DropdownMenu text="Tagging Game" href="#/tagging_game" entries={taggingGameEntries} />
      );
    }
    return (
      <div className={classNames({chromeContainer: true, modalOpen: this.state.uploadModal})}>
        <div className="chromeHeader">
          <div className="mainLogo">
            <a href="#/" className="logoText">
              PepeHub v0.1{String.fromCharCode(945)}
            </a>
            <div className="navButtons">
              <a href="#/popular_tags" className="button">Popular Tags</a>
              <span className="button" onClick={this.randomImage}>Random Pepe</span>
              {taggingGameButton}
            </div>
          </div>
          {uploadButton}
        </div>
        <div className="container">
          {this.props.pageComponent}
        </div>
        {uploadModal}
      </div>
    );
  }
});

module.exports = ChromeView;
