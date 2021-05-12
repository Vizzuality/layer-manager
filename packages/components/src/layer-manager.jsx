import { useState, Children, cloneElement, useEffect } from "react";
import PropTypes from "prop-types";
import Manager from "@vizzuality/layer-manager";

const LayerManager = (props) => {
  const [layerManager, setLayerManager] = useState(null);
  const { map, plugin: Plugin, providers } = props;

  useEffect(() => {
    const pluginInstance = new Plugin(map);
    Object.keys(providers).forEach((key) => {
      Manager.registerProvider(key, providers[key]);
    });
    setLayerManager(new Manager(pluginInstance));
  }, []);

  useEffect(() => {
    return () => layerManager.unmount();
  }, [layerManager]);

  const { children } = this.props;

  if (children && Children.count(children)) {
    return Children.map(
      children,
      (child, i) =>
        child &&
        cloneElement(child, {
          layerManager: this.layerManager,
          zIndex: child.props.zIndex || 1000 - i,
        })
    );
  }

  return null;
};

export default LayerManager;

LayerManager.propTypes = {
  map: PropTypes.shape({}).isRequired,
  plugin: PropTypes.func.isRequired,
  providers: PropTypes.shape({}),
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
};

LayerManager.defaultProps = {
  children: [],
  providers: {},
};
