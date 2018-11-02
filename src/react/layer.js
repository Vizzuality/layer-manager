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

  componentDidUpdate() {
    this.addSpecToLayerManager();
  }

  componentWillUnmount() {
    const { layerManager, id } = this.props;
    layerManager.remove(id);
  }

  addSpecToLayerManager() {
    const { layerManager, ...layerSpec } = this.props;
    layerManager.add([ layerSpec ], {});
  }

  render() {
    return null;
  }
}

export default Layer;
