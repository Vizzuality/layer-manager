import { PureComponent, Children, cloneElement } from 'react';
import PropTypes from 'prop-types';
import Manager from '@vizzuality/layer-manager';

class LayerManager extends PureComponent {
  static propTypes = {
    map: PropTypes.shape({}).isRequired,
    plugin: PropTypes.func.isRequired,
    providers: PropTypes.shape({}),
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
  };

  static defaultProps = {
    children: [],
    providers: {}
  };

  constructor(props) {
    super(props);
    const { map, plugin: Plugin, providers } = props;

    Manager.providers = providers;

    this.layerManager = new Manager(new Plugin(map));
  }

  componentWillUnmount() {
    this.layerManager.unmount();
  }

  render() {
    const { children } = this.props;

    if (children && Children.count(children)) {
      return Children.map(
        children,
        (child, i) =>
          child &&
          cloneElement(child, {
            layerManager: this.layerManager,
            zIndex: child.props.zIndex || 1000 - i
          })
      );
    }

    return null;
  }
}

export default LayerManager;
