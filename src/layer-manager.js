import wriSerializer from 'wri-json-api-serializer';
import LayerModel from './layer-model';

const defaultOptions = { serialize: true };

class LayerManager {
  constructor(map, Plugin, options = {}) {
    this.map = map;
    this.plugin = new Plugin(this.map);
    this.layers = [];
    this.options = Object.assign({}, defaultOptions, options);
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
    let newLayers = this.options.serialize ? wriSerializer(layerSpec) : layerSpec;

    // Converting to array when layerSpec is an object
    if (!Array.isArray(newLayers)) {
      newLayers = [newLayers];
    }

    if (this.layers.length === 0) {
      // Adding all layers to this.layers
      this.layers = newLayers.map((l) => {
        zIndex += 1;
        return new LayerModel({ ...l, opacity, visibility, zIndex });
      });
    } else {
      // If layers already exists it checks ID before adding
      newLayers.forEach((newLayerModel) => {
        const existingLayerModel = this.layers.find(l => l.id === newLayerModel.id);
        if (!existingLayerModel) {
          this.layers.push(new LayerModel({ ...newLayerModel, opacity, visibility, zIndex }));
        } else {
          existingLayerModel.update({ ...newLayerModel, opacity, visibility, zIndex });
        }
      });
    }

    // Returnning a promise
    return this.renderLayers();
  }

  /**
   * Update all layers if layer model has been changed
   */
  update() {
    this.layers.forEach((layerModel) => {
      this.updateOneLayer(layerModel);
    });
  }

  /**
   * Updating a specific layer
   * @param  {Object} layerModel
   */
  updateOneLayer(layerModel) {
    const { opacity, visibility, zIndex } = layerModel;
    if (typeof opacity !== 'undefined') this.plugin.setOpacity(layerModel, opacity);
    if (typeof visibility !== 'undefined') this.plugin.setOpacity(layerModel, !visibility ? 0 : opacity);
    if (typeof zIndex !== 'undefined') this.plugin.setZIndex(layerModel, zIndex);
  }

  /**
   * Remove a layer giving a Layer ID
   * @param  {String} layerId
   */
  remove(layerId) {
    const layers = this.layers.slice(0);

    this.layers.forEach((layerModel, index) => {
      if (layerId) {
        if (layerModel.id === layerId) {
          this.plugin.remove(layerModel);
          layers.splice(index, 1);
        }
      } else {
        this.plugin.remove(layerModel);
      }
    });

    this.layers = layerId ? layers : [];
  }

  /**
   * Render layers
   */
  renderLayers() {
    if (this.layers.length > 0) {
      const promises = this.layers.map((layerModel) => {
        const provider = layerModel.get('provider');

        if (layerModel.mapLayer) {
          this.updateOneLayer(layerModel);
          return new Promise(resolve => resolve(this.layers));
        }

        const method = this.plugin.getLayerByProvider(provider);

        if (!method) {
          return new Promise((resolve, reject) =>
            reject(new Error(`${provider} provider is not yet supported.`)));
        }

        return method.call(this, layerModel).then((layer) => {
          layerModel.setMapLayer(layer);
          this.plugin.add(layerModel);
          this.updateOneLayer(layerModel);
        });
      });
      return Promise.all(promises);
    }

    // By default it will return a empty layers
    return new Promise(resolve => resolve(this.layers));
  }

  /**
   * A namespace to set opacity on selected layer previously with find method
   * @param {String} layerId
   * @param {Number} opacity
   */
  setOpacity(layerId, opacity) {
    const layerModel = this.layers.find(l => l.id === layerId);
    if (layerModel) {
      this.plugin.setOpacity(layerModel, opacity);
    } else {
      console.error('Can\'t find the layer');
    }
  }

  /**
   * A namespace to hide or show a selected layer previously with find method
   * @param {String} layerId
   * @param {Boolean} visibility
   */
  setVisibility(layerId, visibility) {
    const layerModel = this.layers.find(l => l.id === layerId);
    if (layerModel) {
      this.plugin.setVisibility(layerModel, visibility);
    } else {
      console.error('Can\'t find the layer');
    }
  }

  /**
   * A namespace to set z-index on selected layer previously with find method
   * @param {String} layerId
   * @param {Number} zIndex
   */
  setZIndex(layerId, zIndex) {
    const layerModel = this.layers.find(l => l.id === layerId);
    if (layerModel) {
      this.plugin.setZIndex(layerModel, zIndex);
    } else {
      console.error('Can\'t find the layer');
    }
  }
}

export default LayerManager;

