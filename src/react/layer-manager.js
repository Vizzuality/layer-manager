import React, { Component, Children, cloneElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import Manager from 'src/layer-manager';
import PluginCesium from 'plugins/plugin-cesium';
import PluginLeaflet from 'plugins/plugin-leaflet';
import Layer from 'src/react/layer';

const { L } = (typeof window !== 'undefined') ? window : {};

class LayerManager extends Component {
  static propTypes = {
    map: PropTypes.instanceOf(L.Map).isRequired,
    plugin: PropTypes.oneOf([PluginCesium, PluginLeaflet]),
    layersSpec: PropTypes.arrayOf(PropTypes.object),
    onLayerLoading: PropTypes.func,
    children: PropTypes.arrayOf(PropTypes.node)
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

    if (Children.count(children)) {
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

    return (
      <Fragment>
        {
          layersSpec.map(spec => (
            <Layer
              key={spec.id}
              {...spec}
              onLayerLoading={onLayerLoading}
              layerManager={this.layerManager}
            />
          ))
        }
      </Fragment>
    );
  }
}

export default LayerManager;
