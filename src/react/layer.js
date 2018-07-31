import { Component } from 'react';
import PropTypes from 'prop-types';
import LayerManager from 'src/layer-manager';

class Layer extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    layerManager: PropTypes.instanceOf(LayerManager).isRequired,
    onLayerLoading: PropTypes.func
  };

  static defaultProps = {
    onLayerLoading: () => {
    }
  };

  componentDidMount() {
    const { layerManager, onLayerLoading, ...options } = this.props;

    onLayerLoading(true);

    layerManager.add([ options ], options).finally(() => {
      onLayerLoading(false);
    });
  }

  componentDidUpdate() {
    const { layerManager, onLayerLoading, ...options } = this.props;

    onLayerLoading(true);

    layerManager.add([ options ], options).finally(() => {
      onLayerLoading(false);
    });
  }

  componentWillUnmount() {
    const { layerManager, id } = this.props;
    layerManager.remove(id);
  }

  render() {
    return null;
  }
}

export default Layer;
