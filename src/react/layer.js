import { Component } from 'react';
import PropTypes from 'prop-types';

class Layer extends Component {
  static propTypes = { onLayerLoading: PropTypes.func }

  static defaultProps = { onLayerLoading: () => {} }

  componentDidMount() {
    const { layerManager, ...options } = this.props;

    this.props.onLayerLoading(true);

    layerManager.add([options], options)
      .finally(() => { this.props.onLayerLoading(false); });
  }

  componentDidUpdate() {
    const { layerManager, ...options } = this.props;

    this.props.onLayerLoading(true);

    layerManager.add([options], options)
      .finally(() => { this.props.onLayerLoading(false); });
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
