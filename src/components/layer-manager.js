import { PureComponent, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import Manager from '../layer-manager';

class LayerManager extends PureComponent {
  static propTypes = {
    map: PropTypes.shape({}).isRequired,
    plugin: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]),
    onLayerLoading: PropTypes.func,
    onReady: PropTypes.func
  };

  static defaultProps = {
    children: [],
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
    const { children } = this.props;

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

    return null;
  }
}

export default LayerManager;
