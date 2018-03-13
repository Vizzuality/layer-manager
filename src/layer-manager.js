import wriSerializer from 'wri-json-api-serializer';

class LayerManager {
  constructor(mapInstance) {
    this.mapInstance = mapInstance;
    this.layers = [];
  }

  get map() {
    return this.mapInstance;
  }

  /**
   * Add layers
   * @param {Array} layerSpec
   * @param {Object} layerOptions
   */
  add(layerSpec, layerOptions = { opacity: 1, visibility: true, zIndex: 0 }) {
    if (!layerSpec) {
      console.error('layerSpec is required');
      return this;
    }

    if (typeof layerSpec !== 'object' && typeof layerSpec !== 'string') {
      console.errror('layerSpec should be an object or string');
      return this;
    }

    const { opacity, visibility } = layerOptions;
    let { zIndex } = layerOptions;
    const newLayers = wriSerializer(layerSpec);

    if (this.layers.length === 0) {
      // Adding all layers to this.layers
      this.layers = newLayers.map((l) => {
        zIndex += 1;
        return { ...l, opacity, visibility, zIndex };
      });
    } else {
      // If layers already exists it checks ID before adding
      newLayers.forEach((n) => {
        const layerWasAdded = this.layers.find(l => l.id === n.id);
        if (!layerWasAdded) this.layers.push(n);
      });
    }

    if (this.layers.length > 0) this.addLayers();

    return this;
  }

  /**
   * Finding a layer from added layers before
   * @param  {String} layerId
   */
  find(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    return layer;
  }
}

export default LayerManager;

