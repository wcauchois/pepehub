var React = require('react'),
    _ = require('lodash'),
    ApiServices = require('../ApiServices');

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
      previewImage: null
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
        }
      }.bind(this);
    }
  },

  selectFileClicked: function(event) {
    this.fileInput.click();
  },

  doSubmit: function(event) {
    var file = (this.fileInput.files || [])[0];
    if (!file) {
      // TODO: Disable button if this is the case
      alert("You must select a file!");
    } else {
      ApiServices.getSignedRequest({
        file_name: file.name,
        file_type: file.type
      }).then(function(response) {
        return uploadFile(file, response.url);
      }).then(function() {
        alert("Upload successful!");
      });
    }
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
            <a href="#" className="button" onClick={this.selectFileClicked}>Select File</a>
            {previewImage}
            <input type="file" className="hidden" ref={this.gotFileInput} />
            <br />
            <a href="#" className="button" onClick={this.doSubmit}>Submit</a>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = UploadModal;
