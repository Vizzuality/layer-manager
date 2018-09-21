import { Component } from 'react';
import PropTypes from 'prop-types';

class Layer extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    layerManager: PropTypes.any.isRequired,
    onLayerLoading: PropTypes.func,
    onReady: PropTypes.func
  };

  static defaultProps = {
    onLayerLoading: () => {},
    onReady: () => {}
  };

  componentDidMount() {
    const { layerManager, onLayerLoading, onReady, ...options } = this.props;

    onLayerLoading(true);

    layerManager.add([ options ], options)
      .then((layerModel) => {
        onReady(layerModel);
      })
      .finally(() => {
        onLayerLoading(false);
      });
  }

  componentDidUpdate() {
    const { layerManager, onLayerLoading, onReady, ...options } = this.props;

    onLayerLoading(true);

    layerManager.add([ options ], options)
      .then((layerModel) => {
        onReady(layerModel);
      })
      .finally(() => {
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
