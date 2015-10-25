var _ = require('lodash'),
    Promise = require('bluebird'),
    Dispatcher = require('flux').Dispatcher,
    classNames = require('classnames'),
    React = require('react'),
    ReactDOM = require('react-dom');

var HomePage = React.createClass({
  render: function() {
    return (
      <div>
        Hello from React
      </div>
    );
  }
});

global.renderPage = function(el) {
  ReactDOM.render(
    <HomePage />,
    el
  );
};

