import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Manager from '../layer-manager';

class Layer extends PureComponent {
  static propTypes = {
    id: PropTypes.string.isRequired,
    layerManager: PropTypes.instanceOf(Manager)
  };

  static defaultProps = { layerManager: null };

  componentDidMount() {
    this.addSpecToLayerManager();
  }

  componentDidUpdate(prevProps) {
    const { layerManager, id } = this.props;
    if (id && id !== prevProps.id) {
      layerManager.remove(prevProps.id);
    }
    this.addSpecToLayerManager();
  }

  componentWillUnmount() {
    const { layerManager, id } = this.props;
    layerManager.remove(id);
  }

  addSpecToLayerManager() {
    const { layerManager, ...layerSpec } = this.props;
    layerManager.add([layerSpec], {});
  }

  render() {
    return null;
  }
}

export default Layer;
