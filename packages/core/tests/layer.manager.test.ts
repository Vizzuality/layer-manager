import MapboxGLPlugin from '../../plugin-mapboxgl';
import CartoProvider from '../../provider-carto';
import LayerManager from '../src';

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
    const provider = new CartoProvider();
    LayerManager.registerProvider(provider);
    expect(Object.keys(LayerManager.providers)[0]).toBe('carto');
  });

  // Optionally you can add additional providers

  // layerManager.add(layerSpec); // see docs/LAYER-SPEC.md
  // layerManager.remove(1);
});
