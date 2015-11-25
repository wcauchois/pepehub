var React = require('react'),
    _ = require('lodash'),
    ApiServices = require('../ApiServices'),
    classNames = require('classnames');

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

var UploadModal = React.createClass({
  getInitialState: function() {
    return {
      previewImage: null,
      fileSelected: false,
      uploading: false
    }
  },

  closeClicked: function() {
    this.props.onClose();
    return false;
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
      this.setState({uploading: true});
      ApiServices.getSignedRequest({
        file_name: file.name,
        file_type: file.type
      }).then(function(response) {
        return uploadFile(file, response.url).then(function() {
          return response.suffix;
        });
      }).then(function(suffix) {
        return ApiServices.addImage({suffix: suffix});
      }).then(function(newImage) {
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
            Upload a file or whatever<br />
            <span className="button" onClick={this.selectFileClicked}>Select File</span>
            {previewImage}
            <input type="file" className="hidden" ref={this.gotFileInput} />
            <br />
            <span className={classNames({button: true, disabled: !this.canSubmit()})}  onClick={this.doSubmit}>Submit</span>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = UploadModal;
