import {
  PureComponent, Children, cloneElement, isValidElement,
} from 'react';
import Manager from '@vizzuality/lm';
import type { Map } from 'mapbox-gl';
import type { Plugin, PluginConstructor, ProviderMaker } from '@vizzuality/lm';

export type LayerManagerProps = {
  map: Map
  plugin: typeof PluginConstructor
  providers?: Record<string, ProviderMaker['handleData']>
  children?: React.ReactNode
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

  render() {
    const { children } = this.props;

    if (children && Children.count(children)) {
      return Children.map(
        children,
        (child, i) => {
          if (isValidElement(child)) {
            const { zIndex } = child.props;

            return cloneElement(child as any, { //TODO: fix this
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
