import LayerManager from './layer-manager';
import { getLayerByProvider } from './layers/layers-leaflet';

class LayerManagerLeaflet extends LayerManager {
  addLayers() {
    if (this.layers.length > 0) {
      const promises = this.layers.map((layerModel) => {
        const provider = layerModel.get('provider');
        const method = getLayerByProvider(provider);
        if (!method) {
          return new Promise((resolve, reject) =>
            reject(new Error(`${provider} provider is not yet supported.`)));
        }
        return method.call(this, layerModel).then((layer) => {
          layerModel.setMapLayer(layer);
          this.mapInstance.addLayer(layerModel.mapLayer);
        });
      });
      return Promise.all(promises);
    }

    // By default it will return a empty layers
    return new Promise(resolve => resolve(this.layers));
  }

  /**
   * Remove a layer giving a Layer ID
   * @param  {String} layerId
   */
  remove(layerId) {
    this.layers.forEach((layerModel, index) => {
      if (layerModel.id === layerId) {
        this.mapInstance.removeLayer(layerModel.mapLayer);
        this.layers.slice(index, 1);
      }
    });
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
        layerModel.mapLayer.setOpacity(visibility ? 1 : 0);
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
        layerModel.mapLayer.setZIndex(zIndex);
      }
    });
    return this;
  }
}

export default LayerManagerLeaflet;
