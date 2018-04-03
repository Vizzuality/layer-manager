import wriSerializer from 'wri-json-api-serializer';
import LayerModel from './layer-model';

class LayerManager {
  constructor(mapInstance, options = {}) {
    this.mapInstance = mapInstance;
    this.layers = [];
    this.options = options;
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
    if (typeof layerSpec === 'undefined') {
      console.error('layerSpec is required');
      return this;
    }

    if (typeof layerSpec !== 'object' && typeof layerSpec !== 'string') {
      console.error('layerSpec should be an object or string');
      return this;
    }

    const { opacity, visibility } = layerOptions;
    let { zIndex } = layerOptions;
    const newLayers = this.options.serialize ? wriSerializer(layerSpec) : layerSpec;

    if (this.layers.length === 0) {
      // Adding all layers to this.layers
      this.layers = newLayers.map((l) => {
        zIndex += 1;
        return new LayerModel({ ...l, opacity, visibility, zIndex });
      });
    } else {
      // If layers already exists it checks ID before adding
      newLayers.forEach((newLayerModel) => {
        const existedLayerModel = this.layers.find(l => l.id === newLayerModel.id);
        if (!existedLayerModel) {
          this.layers.push(new LayerModel({ ...newLayerModel, opacity, visibility, zIndex }));
        } else {
          existedLayerModel.update({ ...newLayerModel, opacity, visibility, zIndex });
        }
      });
    }

    // Returnning a promise
    return this.renderLayers();
  }

  /**
   * Finding a layer from added layers before
   * @param  {String} layerId
   */
  find(layerId) {
    const layer = this.layers.find(l => l.id === layerId);
    return layer;
  }

  /**
   * Remove a layer giving a Layer ID
   * @param  {String} layerId
   */
  // remove(layerId) {
  //   this.layers.forEach((layerModel, index) => {
  //     if (layerModel.id === layerId) {
  //       this.layers.slice(index, 1);
  //     }
  //   });
  // }
}

export default LayerManager;

