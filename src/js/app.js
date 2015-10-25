var _ = require('lodash'),
    Promise = require('bluebird'),
    Dispatcher = require('flux').Dispatcher,
    classNames = require('classnames'),
    React = require('react/addons');

var HomePage = React.createClass({
  render: function() {
    return (
      <div>
        Hello from React
      </div>
    );
  }
});

global.renderPage = function(el, params) {
  React.render(
    <HomePage />,
    el
  );
};

