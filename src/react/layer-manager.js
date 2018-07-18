import React, { Component } from 'react';

import Manager from 'src/layer-manager';

class LayerManager extends Component {
  constructor(props) {
    super(props);
    const { map, plugin, options } = props;
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
