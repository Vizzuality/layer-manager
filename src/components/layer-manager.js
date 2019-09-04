import React, { PureComponent, Children, cloneElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import Manager from '../layer-manager';
import Layer from './layer';

class LayerManager extends PureComponent {
  static propTypes = {
    map: PropTypes.object.isRequired,
    plugin: PropTypes.func.isRequired,
    layersSpec: PropTypes.arrayOf(PropTypes.object),
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    onLayerLoading: PropTypes.func,
    onReady: PropTypes.func
  };

  static defaultProps = {
    children: [],
    layersSpec: [],
    onLayerLoading: null,
    onReady: null
  };

  constructor(props) {
    super(props);
    const { map, plugin } = props;
    this.layerManager = new Manager(map, plugin);
  }

  componentDidMount() {
    this.onRenderLayers();
  }

  componentDidUpdate() {
    this.onRenderLayers();
  }

  onRenderLayers = () => {
    const { onLayerLoading, onReady } = this.props;
    if (this.layerManager.layers && this.layerManager.layers.length) {
      if (onLayerLoading) onLayerLoading(true);
      this.layerManager.renderLayers().then((layers) => {
        if (onReady) onReady(layers);
        if (onLayerLoading) onLayerLoading(false);
      });
    }
  }

  render() {
    const { children, layersSpec } = this.props;

    if (children && Children.count(children)) {
      return Children.map(
        children,
        (child, i) => child
            && cloneElement(child, {
              layerManager: this.layerManager,
              zIndex: child.props.zIndex || 1000 - i
            })
      );
    }

    if (layersSpec && layersSpec.length) {
      return (
        <Fragment>
          {layersSpec.map((spec, i) => (
            <Layer
              key={spec.id}
              {...spec}
              zIndex={spec.zIndex || 1000 - i}
              layerManager={this.layerManager}
            />
          ))}
        </Fragment>
      );
    }

    return null;
  }
}

export default LayerManager;
