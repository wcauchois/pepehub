var React = require('react'),
    _ = require('lodash'),
    classNames = require('classnames'),
    ReactDOM = require('react-dom');

var DropdownMenu = React.createClass({
  getInitialState: function() {
    return {open: false};
  },

  caretClicked: function(e) {
    this.setState({open: !this.state.open});
  },

  render: function() {
    var dropdownEntries = _.map(this.props.entries, function(entry, index) {
      var text = entry[0];
      var href = entry[1];
      return (
        <li key={index.toString()}>
          <a href={href} className="button">{text}</a>
        </li>
      );
    });
    return (
      <div className={classNames({dropdown: true, open: this.state.open})}>
        <a href={this.props.href} className="button mainButton">
          {this.props.text}
        </a>
        <span className="button caret" onClick={this.caretClicked}>
          {String.fromCharCode(9660)}
        </span>
        <ul className="dropdownMenu" ref={this.gotDropdownMenu}>
          {dropdownEntries}
        </ul>
      </div>
    );
  },

  gotDropdownMenu: function(dropdownMenu) {
    var domNode = ReactDOM.findDOMNode(this);
    if (domNode) {
      dropdownMenu.style.minWidth = '' + domNode.offsetWidth + 'px';
    }
  }
});

module.exports = DropdownMenu;
