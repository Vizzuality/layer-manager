import rasterLayer from './raster-layer-mapbox-gl';
import cartoLayer from './carto-layer-mapbox-gl';
import vectorLayer from './vector-layer-mapbox-gl';
import geoJsonLayer from './geojson-layer-mapbox-gl';

class PluginMapboxGL {
  constructor(map) {
    this.map = map;
  }

  events = {};

  method = {
    leaflet: rasterLayer,
    cartodb: cartoLayer,
    mapbox: vectorLayer,
    geojson: geoJsonLayer
  };

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel) {
    const { mapLayer } = layerModel;
    this.map.addSource(mapLayer.id, mapLayer.source);
    if (mapLayer.layer) {
      this.map.addLayer(mapLayer.layer);
    }
    if (mapLayer.layers) {
      mapLayer.layers.forEach((l) => {
        this.map.addLayer(l);
      });
    }
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel) {
    const { mapLayer } = layerModel;

    this.map.removeLayer(mapLayer.id);
  }

  /**
   * Get provider method
   * @param {String} provider
   */
  getLayerByProvider(provider) {
    return this.method[provider];
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   * @param {Number} zIndex
   */
  setZIndex(layerModel, zIndex) {
    // const { mapLayer } = layerModel;
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const { mapLayer } = layerModel;
    this.map.setPaintProperty(mapLayer.id, `${mapLayer.layer.type}-opacity`, opacity);
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    const { mapLayer } = layerModel;

    this.map.setLayoutProperty(mapLayer.id, 'visibility', visibility ? 'visible' : 'none');
  }

  setParams(layerModel) {
    this.remove(layerModel);
  }

  setLayerConfig(layerModel) {
    this.remove(layerModel);
  }

  setDecodeParams(layerModel) {
    const {
      mapLayer,
      params,
      sqlParams,
      decodeParams,
      decodeFunction
    } = layerModel;

    mapLayer.reDraw({ decodeParams, decodeFunction, params, sqlParams });

    return this;
  }
}

export default PluginMapboxGL;
