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
      newLayers.forEach((l) => {
        const layerWasAdded = this.layers.find(n => n.id === l.id);
        if (!layerWasAdded) this.layers.push(l);
      });
    }

    if (this.layers.length > 0) this.addLayers();
  }
}

export default LayerManager;

