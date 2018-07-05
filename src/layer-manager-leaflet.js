import LayerManager from './layer-manager';
import { getLayerByProvider } from './layers/layers-leaflet';

class LayerManagerLeaflet extends LayerManager {
  /**
   * Updating a specific layer
   * @param  {Object} layerModel
   */
  static updateOneLayer(layerModel) {
    const { opacity, visibility, zIndex } = layerModel;
    if (typeof opacity !== 'undefined') layerModel.mapLayer.setOpacity(opacity);
    if (typeof visibility !== 'undefined') layerModel.mapLayer.setOpacity(!visibility ? 0 : opacity);
    if (typeof zIndex !== 'undefined') layerModel.mapLayer.setZIndex(zIndex);
  }

  /**
   * Render layers
   */
  renderLayers() {
    if (this.layers.length > 0) {
      const promises = this.layers.map((layerModel) => {
        const provider = layerModel.get('provider');

        if (layerModel.mapLayer) {
          LayerManagerLeaflet.updateOneLayer(layerModel);
          return new Promise(resolve => resolve(this.layers));
        }

        const method = getLayerByProvider(provider);

        if (!method) {
          return new Promise((resolve, reject) =>
            reject(new Error(`${provider} provider is not yet supported.`)));
        }

        return method.call(this, layerModel).then((layer) => {
          layerModel.setMapLayer(layer);
          this.mapInstance.addLayer(layerModel.mapLayer);
          LayerManagerLeaflet.updateOneLayer(layerModel);
        });
      });
      return Promise.all(promises);
    }

    // By default it will return a empty layers
    return new Promise(resolve => resolve(this.layers));
  }

  /**
   * Update all layers if layer model has been changed
   */
  update() {
    this.layers.forEach(layerModel => LayerManagerLeaflet.updateOneLayer(layerModel));
  }

  /**
   * Remove a layer giving a Layer ID
   * @param  {String} layerId
   */
  remove(layerModel) {
    this.mapInstance.removeLayer(layerModel.mapLayer);
  }

  /**
   * A namespace to set opacity on selected layer previously with find method
   * @param {String} layerId
   * @param {Number} opacity
   */
  setOpacity(layerId, opacity) {
    this.layers.forEach((layerModel) => {
      if (layerModel.id === layerId && layerModel.opacity !== opacity) {
        layerModel.setOpacity(opacity);
        layerModel.mapLayer.setOpacity(opacity);
      }
    });
    return this;
  }

  /**
   * A namespace to hide or show a selected layer previously with find method
   * @param {String} layerId
   * @param {Boolean} visibility
   */
  setVisibility(layerId, visibility) {
    this.layers.forEach((layerModel) => {
      if (layerModel.id === layerId) {
        layerModel.setVisibility(visibility);
        layerModel.mapLayer.setOpacity(!visibility ? 0 : layerModel.opacity);
      }
    });
    return this;
  }

  /**
   * A namespace to set z-index on selected layer previously with find method
   * @param {String} layerId
   * @param {Number} zIndex
   */
  setZIndex(layerId, zIndex) {
    this.layers.forEach((layerModel) => {
      if (layerModel.id === layerId) {
        layerModel.setZIndex(zIndex);
        layerModel.mapLayer.setZIndex(zIndex);
      }
    });
    return this;
  }
}

export default LayerManagerLeaflet;
