/* eslint-disable import/no-extraneous-dependencies */
import { Component } from 'react';
import PropTypes from 'prop-types';

class Layer extends Component {
  static propTypes = {
    id: PropTypes.string,
    layerManager: PropTypes.object,
    onLayerLoading: PropTypes.func
  }

  static defaultProps = {
    id: '',
    layerManager: {},
    onLayerLoading: () => {}
  }

  componentDidMount() {
    const { layerManager, onLayerLoading, ...options } = this.props;

    onLayerLoading(true);

    layerManager.add([options], options)
      .finally(() => { onLayerLoading(false); });
  }

  componentDidUpdate() {
    const { layerManager, onLayerLoading, ...options } = this.props;

    onLayerLoading(true);

    layerManager.add([options], options)
      .finally(() => { onLayerLoading(false); });
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
