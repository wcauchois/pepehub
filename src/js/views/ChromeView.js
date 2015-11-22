var React = require('react'),
    _ = require('lodash');

var ChromeView = React.createClass({
  render: function() {
    return (
      <div className="chromeContainer">
        <div className="logo">
          PepeHub v0.1{String.fromCharCode(945)}
        </div>
        <div className="container">
          {this.props.pageComponent}
        </div>
      </div>
    );
  }
});

module.exports = ChromeView;
