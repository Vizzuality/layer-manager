import { Component, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';

import Manager from 'src/layer-manager';

class LayerManager extends Component {
  static propTypes = {
    map: PropTypes.object,
    plugin: PropTypes.func,
    options: PropTypes.object,
    children: PropTypes.array
  };

  static defaultProps = { map: {}, plugin: {}, options: {}, children: {} };

  constructor(props) {
    super(props);
    const { map, plugin, options } = props;
    this.layerManager = new Manager(map, plugin, options);
  }

  render() {
    const { children } = this.props;
    return Children.map(
      children,
      (child, i) =>
        child &&
          cloneElement(child, {
            layerManager: this.layerManager,
            zIndex: 1000 - i
          })
    );
  }
}

export default LayerManager;
