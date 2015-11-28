var React = require('react'),
    _ = require('lodash'),
    ApiServices = require('../ApiServices'),
    classNames = require('classnames'),
    Promise = require('bluebird');

function uploadFile(file, signedRequest) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", signedRequest);
    xhr.setRequestHeader('x-amz-acl', 'public-read');
    xhr.onload = function() {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.onerror = function() {
      reject();
    };
    xhr.send(file);
  });
}

function imageIsLoaded(src) {
  return new Promise(function(resolve, reject) {
    var image = new Image();
    image.onload = function() { resolve(true); };
    image.onerror = function() { resolve(false); };
    image.src = src;
  });
}

function waitForImage(src, nTimes) {
  var maxTimes = 5;
  nTimes = (typeof nTimes === 'undefined') ? maxTimes : nTimes;
  if (nTimes <= 0) {
    return Promise.reject();
  } else {
    return (
      Promise.delay(500)
        .then(function() {
          return imageIsLoaded(src);
        })
        .then(function(result) {
          if (result) {
            return true;
          } else {
            return waitForImage(src, nTimes - 1);
          }
        })
    );
  }
}

var LoadingBar = React.createClass({
  render: function() {
    return (
      <div className="loadingBar">
        <span className="stripes"></span>
        <div className="content">{this.props.message}</div>
      </div>
    );
  }
});

var UploadModal = React.createClass({
  getInitialState: function() {
    return {
      previewImage: null,
      fileSelected: false,
      uploading: false,
      loadingMessage: ''
    }
  },

  closeClicked: function(event) {
    event.preventDefault();
    this.props.onClose();
  },

  containerClicked: function(event) {
    if (event.target === this.modalContainer) {
      this.props.onClose();
      return false;
    }
  },

  gotModalContainer: function(ref) {
    this.modalContainer = ref;
  },

  gotFileInput: function(ref) {
    this.fileInput = ref;
    if (this.fileInput) {
      this.fileInput.onchange = function() {
        if (this.fileInput.files && this.fileInput.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) {
            this.setState({previewImage: e.target.result});
          }.bind(this);
          reader.readAsDataURL(this.fileInput.files[0]);
          this.setState({fileSelected: true});
        }
      }.bind(this);
    }
  },

  selectFileClicked: function(event) {
    this.fileInput.click();
  },

  doSubmit: function(event) {
    var file = (this.fileInput.files || [])[0];
    if (file && this.canSubmit()) {
      this.setState({
        uploading: true,
        loadingMessage: 'Uploading image'
      });
      ApiServices.getSignedRequest({
        file_name: file.name,
        file_type: file.type
      }).then(function(response) {
        return uploadFile(file, response.url).then(function() {
          return response;
        });
      }).then(function(response) {
        return waitForImage(response.thumbnail_url).then(function() {
          return response.suffix;
        });
      }).then(function(suffix) {
        return ApiServices.addImage({suffix: suffix});
      }).then(function(newImage) {
        this.setState({loadingMessage: ''});
        // XXX figure out how to really make the page reload
        this.props.router.navigate('/image/' + newImage.id);
      }.bind(this));
    }
  },

  canSubmit: function() {
    return this.state.fileSelected && !this.state.uploading;
  },

  render: function() {
    var previewImage;
    if (this.state.previewImage) {
      previewImage = (
        <div className="previewImage">
          <img src={this.state.previewImage} />
        </div>
      );
    }
    return (
      <div className="modalContainer" onClick={this.containerClicked} ref={this.gotModalContainer}>
        <div className="modalDialog uploadModal">
          <div className="modalTitle">
            <h4>Upload Pepe</h4>
            <div className="close">
              <a href="#" onClick={this.closeClicked}>{String.fromCharCode(215)}</a>
            </div>
          </div>
          <div className="modalContent">
            <div className="button selectFile" onClick={this.selectFileClicked}>Select File</div>
            {previewImage}
            <input type="file" className="hidden" ref={this.gotFileInput} />
            <div className={classNames({button: true, disabled: !this.canSubmit(), submitButton: true})}
              onClick={this.doSubmit}>Start Upload</div>
            <div className={classNames({loadingBarContainer: true, closed: !this.state.loadingMessage})}>
              <LoadingBar message={this.state.loadingMessage} />
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = UploadModal;
