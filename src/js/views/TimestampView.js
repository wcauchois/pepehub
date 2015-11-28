var React = require('react'),
    _ = require('lodash'),
    moment = require('moment');

var TimestampView = React.createClass({
  render: function() {
    var m = moment(this.props.timestamp);
    var formatted = m.format('MM/DD/YY(ddd) HH:mm:ss');
    var relative = m.fromNow();
    return (
      <div className="timestamp">
        <span title={relative}>
          {formatted}
        </span>
      </div>
    );
  }
});

module.exports = TimestampView;

