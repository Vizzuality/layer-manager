
import rasterLayer from './raster-layer-mapbox-gl';
import vectorLayer from './vector-layer-mapbox-gl';
import geoJsonLayer from './geojson-layer-mapbox-gl';

class PluginMapboxGL {
  constructor(map) {
    this.map = map;
  }

  method = {
    leaflet: rasterLayer,
    gee: rasterLayer,
    cartodb: vectorLayer,
    mapbox: vectorLayer,
    geojson: geoJsonLayer
  };

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel, layers) {
    const { mapLayer } = layerModel;
    if (this.map.getSource(mapLayer.id)) {
      this.map.removeSource(mapLayer.id);
    }
    this.map.addSource(mapLayer.id, mapLayer.source);
    if (mapLayer && mapLayer.layers) {
      mapLayer.layers.forEach((l) => {
        const nextLayerId = this.getNextLayerId(layers, l.zIndex);
        this.map.addLayer(l, nextLayerId);
      });
    }
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel) {
    const { mapLayer } = layerModel;
    if (mapLayer && mapLayer.layers && this.map) {
      mapLayer.layers.forEach((l) => {
        this.map.removeLayer(l.id);
      });
    }
  }

  /**
   * Get provider method
   * @param {String} provider
   */
  getLayerByProvider(provider) {
    return this.method[provider];
  }

  getNextLayerId(layers, zIndex) {
    const layersOnMap = this.map.getStyle().layers.map(l => l.id);
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const nextLayer = sortedLayers.find(l => l.zIndex > zIndex);
    const mapLayerIds = layersOnMap.filter(l => l.includes(nextLayer && nextLayer.id));

    return mapLayerIds && mapLayerIds[0];
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   * @param {Number} zIndex
   */
  setZIndex(layerModel, zIndex, layers) {
    const nextLayerId = this.getNextLayerId(layers, zIndex);
    if (nextLayerId) {
      this.map.moveLayer(layerModel.id, nextLayerId);
    }
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const { mapLayer } = layerModel;
    if (mapLayer.layer) {
      this.map.setPaintProperty(mapLayer.id, `${mapLayer.layer.type}-opacity`, opacity);
    }
    if (mapLayer.layers) {
      mapLayer.layers.forEach((l) => {
        this.map.setPaintProperty(l.id, `${l.type}-opacity`, opacity);
      });
    }
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

  setEvents() {
  }

  setDecodeParams(layerModel) {
    const {
      mapLayer,
      params,
      sqlParams,
      decodeParams,
      decodeFunction
    } = layerModel;

    return this;
  }
}

export default PluginMapboxGL;
