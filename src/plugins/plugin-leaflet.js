import cartoLayer from '../layers/carto-layer/carto-layer-leaflet';
import esriLayer from '../layers/esri-layer/esri-layer-leaflet';

class PluginLeaflet {
  constructor(map) {
    this.map = map;
  }

  method = {
    // CARTO
    cartodb: cartoLayer,
    carto: cartoLayer,

    // ESRI
    arcgis: esriLayer,
    featureservice: esriLayer,
    mapservice: esriLayer,
    tileservice: esriLayer,
    esrifeatureservice: esriLayer,
    esrimapservice: esriLayer,
    esritileservice: esriLayer,
    gee: esriLayer
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
   * Get provider method
   * @param {String} provider
   */
  getLayerByProvider(provider) {
    return this.method[provider];
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    layerModel.mapLayer.setOpacity(opacity);
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    layerModel.mapLayer.setOpacity(!visibility ? 0 : layerModel.opacity);
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   * @param {Number} zIndex
   */
  setZIndex(layerModel, zIndex) {
    layerModel.mapLayer.setZIndex(zIndex);
  }
}

export default PluginLeaflet;
