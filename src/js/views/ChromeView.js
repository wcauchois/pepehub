var React = require('react'),
    _ = require('lodash'),
    classNames = require('classnames'),
    UploadModal = require('./UploadModal');

var ChromeView = React.createClass({
  getInitialState: function() {
    return {
      uploadModal: false
    };
  },

  uploadClicked: function() {
    this.setState({uploadModal: true});
  },

  uploadModalClosed: function() {
    this.setState({uploadModal: false});
  },

  render: function() {
    var uploadModal;
    if (this.state.uploadModal) {
      uploadModal = <UploadModal onClose={this.uploadModalClosed} />
    }
    return (
      <div className={classNames({chromeContainer: true, modalOpen: this.state.uploadModal})}>
        <div className="logo">
          <div className="logoText">
            PepeHub v0.1{String.fromCharCode(945)}
          </div>
          <div className="uploadButton">
            <a href="#" className="button" onClick={this.uploadClicked}>Upload</a>
          </div>
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
