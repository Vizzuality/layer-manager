import React, { Component } from 'react';

import Manager from '../layer-manager';

class LayerManager extends Component {
  componentDidMount() {
    const { map, plugin, options } = this.props;
    this.layerManager = new Manager(map, plugin, options);
  }

  render() {
    const { children } = this.props;
    return React.Children.map(
      children,
      (child, i) => (child && React.cloneElement(child, {
        layerManager: this.layerManager,
        zIndex: 1000 - i
      }))
    );
  }
}

export default LayerManager;
