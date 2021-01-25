import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';

class SidebarComponent extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired
  };

  render() {
    const { children } = this.props;

    return (
      <div className="c-sidebar">
        <div className="sidebar--scroll">{children}</div>
      </div>
    );
  }
}

export default SidebarComponent;
