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
    ])
  };

  static defaultProps = {
    children: []
  };

  constructor(props) {
    super(props);
    const { map, plugin } = props;
    this.layerManager = new Manager(map, plugin);
  }

  render() {
    const { children } = this.props;

    if (children && Children.count(children)) {
      return Children.map(
        children,
        (child, i) => child && cloneElement(child, {
          layerManager: this.layerManager,
          zIndex: child.props.zIndex || 1000 - i
        })
      );
    }

    return null;
  }
}

export default LayerManager;
