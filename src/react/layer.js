import { Component } from 'react';
import PropTypes from 'prop-types';
import Manager from '../layer-manager';

class Layer extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    layerManager: PropTypes.instanceOf(Manager),
    onLayerLoading: PropTypes.func,
    onReady: PropTypes.func,
  };

  static defaultProps = {
    layerManager: null,
    onLayerLoading: () => {
    },
    onReady: () => {
    },
  };

  componentDidMount() {
    this.requestLayer();
  }

  componentDidUpdate() {
    this.requestLayer();
  }

  componentWillUnmount() {
    const { layerManager, id } = this.props;
    layerManager.remove(id);
  }

  requestLayer() {
    const { layerManager, onLayerLoading, onReady, ...options } = this.props;

    onLayerLoading(true);

    layerManager
      .add([ options ], options)
      .then(layerModel => {
        onReady(layerModel);
      })
      .finally(() => {
        onLayerLoading(false);
      });
  }

  render() {
    return null;
  }
}

export default Layer;
