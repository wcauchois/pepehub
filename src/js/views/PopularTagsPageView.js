var React = require('react'),
    _ = require('lodash');

var PopularTagsPageView = React.createClass({
  render: function() {
    var tagRows = _.map(this.props.tags, function(item) {
      return (
        <tr>
          <td>
            <a href={"#/tag/" + item.name}>
              {item.name}
            </a>
          </td>
          <td>{item.total}</td>
        </tr>
      );
    });

    return (
      <div>
        <div className="header">
          <h3>
            Popular Tags on PepeHub
          </h3>
        </div>
        <div className="popularTags">
          <table>
            {tagRows}
          </table>
        </div>
      </div>
    );
  }
});

module.exports = PopularTagsPageView;
