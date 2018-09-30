import React, { PureComponent, Children, cloneElement, Fragment } from 'react';
import PropTypes from 'prop-types';
import Manager from '../layer-manager';
import Layer from './layer';

class LayerManager extends PureComponent {
  static propTypes = {
    map: PropTypes.instanceOf(L.Map).isRequired,
    plugin: PropTypes.func.isRequired,
    layersSpec: PropTypes.arrayOf(PropTypes.object),
    onLayerLoading: PropTypes.func,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  static defaultProps = {
    children: null,
    layersSpec: null,
    onLayerLoading: () => null,
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
              zIndex: child.props.zIndex || 1000 - i,
            }),
      );
    }

    return (
      <Fragment>
        {layersSpec.map((spec, i) => (
          <Layer
            key={spec.id}
            {...spec}
            zIndex={spec.zIndex || 1000 - i}
            onLayerLoading={onLayerLoading}
            layerManager={this.layerManager}
          />
        ))}
      </Fragment>
    );
  }
}

export default LayerManager;
