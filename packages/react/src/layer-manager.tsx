import React, {
  PureComponent, Children, cloneElement, ReactNode,
} from 'react';
import Manager from '@vizzuality/layer-manager';
import type { Map } from 'mapbox-gl';
import type { Plugin, PluginConstructor, ProviderMaker } from '@vizzuality/layer-manager';

type LayerManagerProps = {
  map: Map
  plugin: typeof PluginConstructor
  providers?: Record<string, ProviderMaker['handleData']>
  children?: React.ReactNode
};

type ChildProps = {
  zIndex?: number
};

class LayerManagerComponent extends PureComponent<LayerManagerProps> {
  public layerManager;

  constructor(props: LayerManagerProps) {
    super(props);
    const { map, plugin: PluginMaker, providers } = props;

    if (providers) Manager.providers = providers;

    const pluginInstance = new PluginMaker(map) as Plugin;
    this.layerManager = new Manager(pluginInstance);
  }

  componentWillUnmount(): void {
    this.layerManager.unmount();
  }

  render(): ReactNode {
    const { children } = this.props;

    if (children && Children.count(children)) {
      return Children.map<ReactNode, ReactNode>(
        children,
        (child, i) => {
          if (React.isValidElement(child)) {
            const { zIndex } = child.props as ChildProps;
            return cloneElement(child, {
              layerManager: this.layerManager,
              zIndex: zIndex || 1000 - i,
            });
          }
          return null;
        },
      );
    }

    return null;
  }
}

export default LayerManagerComponent;
