import React, { Component, Children, cloneElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import PluginLeaflet from 'plugins/plugin-leaflet/index';
import Manager from '../layer-manager';
import Layer from './layer';

class LayerManager extends Component {
  static propTypes = {
    map: PropTypes.object.isRequired,
    plugin: PropTypes.func,
    layersSpec: PropTypes.arrayOf(PropTypes.object),
    onLayerLoading: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.func
    ])
  };

  static defaultProps = {
    plugin: PluginLeaflet,
    children: [],
    layersSpec: [],
    onLayerLoading: () => {}
  };

  constructor(props) {
    super(props);
    const { map, plugin } = props;
    this.layerManager = new Manager(map, plugin);
  }

  render() {
    const { children, layersSpec, onLayerLoading } = this.props;

    if (children && typeof children === 'function') {
      return children(this.layerManager);
    }

    if (Children.count(children)) {
      return Children.map(
        children,
        (child, i) =>
          child &&
            cloneElement(child, {
              layerManager: this.layerManager,
              zIndex: child.props.zIndex || (1000 - i)
            })
      );
    }

    return (
      <Fragment>
        {layersSpec.map((spec, i) => (
          <Layer
            key={spec.id}
            {...spec}
            zIndex={spec.zIndex || (1000 - i)}
            onLayerLoading={onLayerLoading}
            layerManager={this.layerManager}
          />
        ))}
      </Fragment>
    );
  }
}

export default LayerManager;
