
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

    // remove old source
    if (this.map.getSource(mapLayer.id)) {
      this.map.removeSource(mapLayer.id);
    }

    // add source if it has one
    if (mapLayer.source) {
      this.map.addSource(mapLayer.id, mapLayer.source);
    }

    // add layers
    if (mapLayer && mapLayer.layers) {
      const nextLayerId = this.getNextLayerId(layers, layerModel.zIndex);
      mapLayer.layers.forEach((l) => {
        this.map.addLayer(l, nextLayerId);
        layers.forEach(layer => this.setZIndex(layer, layer.zIndex, layers));
      });
    }
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel) {
    const { mapLayer } = layerModel;
    if (mapLayer && mapLayer.layers && this.map && this.map.style) {
      mapLayer.layers.forEach((l) => {
        this.map.removeLayer(l.id);
      });
    }
  }

  /**
   * Get provider method
   * @param {String} provider
   */
  getLayerByProvider(provider, layerModel) {
    // required to maintain current layerSpec without creating a breaking change
    if (provider === 'leaflet' && layerModel.layerConfig.type === 'cluster') {
      return this.method.geojson;
    }
    return this.method[provider];
  }

  /**
   * Get all mapbox layers
   */
  getLayersOnMap() {
    return this.map.getStyle().layers;
  }

  /**
   * Get the layer above the given z-index
   * @param {Array} layers
   * @param {Object} layerModel
   */
  getNextLayerId(layers, zIndex) {
    const layersOnMap = this.getLayersOnMap();
    const layersOnMapIds = layersOnMap.map(l => l.id);
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    const firstLabelLayer = layersOnMap && layersOnMap.length && layersOnMap.find(l => l.id.includes('label') || l.id.includes('place') || l.id.includes('poi'));

    const nextLayer = sortedLayers.find(l => l.zIndex > zIndex) || firstLabelLayer;
    const { decodeFunction, id } = nextLayer || {};
    const mapLayerIds = layersOnMapIds.filter(l => (
      l.includes(decodeFunction ? id : nextLayer && nextLayer.id)
    ));

    return (mapLayerIds && mapLayerIds[0]);
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   * @param {Number} zIndex
   * @param {Array} layers
   */
  setZIndex(layerModel, zIndex, layers) {
    const layersOnMap = this.getLayersOnMap();
    const nextLayerId = this.getNextLayerId(layers, zIndex);
    const layersToSetIndex = layersOnMap.filter(l => l.id.includes(layerModel.id));

    if (layerModel.decodeFunction) {
      layersToSetIndex.push({ id: `${layerModel.id}-raster-decode` });
    }

    if (nextLayerId && layersToSetIndex && layersToSetIndex.length) {
      layersToSetIndex.forEach(l => this.map.moveLayer(l.id, nextLayerId));
    }
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const { mapLayer, decodeFunction } = layerModel;
    if (mapLayer.layer && !decodeFunction) {
      this.map.setPaintProperty(mapLayer.id, `${mapLayer.layer.type}-opacity`, opacity);
    }
    if (mapLayer.layers && !decodeFunction) {
      mapLayer.layers.forEach((l) => {
        if (l.type === 'symbol') {
          this.map.setPaintProperty(l.id, 'icon-opacity', opacity);
          this.map.setPaintProperty(l.id, 'text-opacity', opacity);
        } else if (l.type === 'circle') {
          this.map.setPaintProperty(l.id, 'circle-opacity', opacity);
          this.map.setPaintProperty(l.id, 'circle-stroke-opacity', opacity);
        } else {
          this.map.setPaintProperty(l.id, `${l.type}-opacity`, opacity);
        }
      });
    }
    if (decodeFunction) {
      mapLayer.layers[0].setProps({ opacity });
    }
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    const { mapLayer } = layerModel;

    if (mapLayer && mapLayer.layers && this.map && this.map.style) {
      mapLayer.layers.forEach((l) => {
        this.map.setLayoutProperty(l.id, 'visibility', visibility ? 'visible' : 'none');
      });
    }
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
      decodeParams
    } = layerModel;

    mapLayer.layers[0].setProps({ decodeParams });

    return this;
  }
}

export default PluginMapboxGL;
