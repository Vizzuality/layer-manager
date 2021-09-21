import MapboxGLPlugin from '../../plugin-mapboxgl';
import CartoProvider from '../../provider-carto';
import LayerManager from '../src';

import type { ProviderMaker } from '../types';

describe('LayerManager', () => {
  const map = {
    on() {
      return null;
    },
  }; // DUMMY MAP
  const plugin = new MapboxGLPlugin(map);
  const layerManager = new LayerManager(plugin);

  it('should be an instance of LayerManager', () => {
    expect(layerManager).toBeInstanceOf(LayerManager);
  });

  it('should exist the possibility of register a provider', () => {
    const provider: unknown = new CartoProvider();
    LayerManager.registerProvider(provider as ProviderMaker);
    expect(Object.keys(LayerManager.providers)[0]).toBe('carto');
  });
});
