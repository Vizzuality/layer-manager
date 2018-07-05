import { getLayerByProvider as getLayer } from '../layers/layers-leaflet';

class PluginLeaflet {
  constructor(map) {
    this.map = map;
  }

  getLayerByProvider(provider) {
    return getLayer(provider);
  }

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel) {
    this.map.addLayer(layerModel.mapLayer);
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel) {
    this.map.removeLayer(layerModel.mapLayer);
  }

  /**
   * A namespace to set opacity on selected layer previously with find method
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    layerModel.mapLayer.setOpacity(opacity);
  }

  /**
   * A namespace to hide or show a selected layer previously with find method
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    layerModel.mapLayer.setOpacity(!visibility ? 0 : layerModel.opacity);
  }

  /**
   * A namespace to set z-index on selected layer previously with find method
   * @param {Object} layerModel
   * @param {Number} zIndex
   */
  setZIndex(layerModel, zIndex) {
    layerModel.mapLayer.setZIndex(zIndex);
  }
}

export default PluginLeaflet;
