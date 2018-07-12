import { Component } from 'react';
import PropTypes from 'prop-types';

class Layer extends Component {
  componentDidMount() {
    const { layerManager, ...options } = this.props;
    layerManager.add([options], options);
  }

  componentDidUpdate() {
    const { layerManager, ...options } = this.props;
    layerManager.add([options], options);
  }

  componentWillUnmount() {
    const { layerManager, id } = this.props;
    layerManager.remove(id);
  }

  render() {
    return null;
  }
}

Layer.propTypes = {
  layerManager: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired
};

export default Layer;
