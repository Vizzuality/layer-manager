
import sortBy from 'lodash/sortBy';

import rasterLayer from './raster-layer-mapbox-gl';
import vectorLayer from './vector-layer-mapbox-gl';
import geoJsonLayer from './geojson-layer-mapbox-gl';

class PluginMapboxGL {
  constructor(map, options) {
    this.map = map;
    this.options = options;

    // You can change mapStyles and all the layers will be repositioned
    this.map.on('style.load', () => {
      const { getLayers } = this.options;
      const layers = getLayers();

      layers.forEach(layer => this.add(layer, layers));
    });
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
    if (mapLayer.id && this.map && this.map.getSource(mapLayer.id)) {
      this.map.removeSource(mapLayer.id);
    }

    // add source if it has one
    if (mapLayer.source && mapLayer.id && this.map) {
      this.map.addSource(mapLayer.id, mapLayer.source);
    }

    // add layers
    if (mapLayer && mapLayer.layers) {
      mapLayer.layers.forEach((l) => {
        const { metadata = {} } = l;
        const { position } = metadata;
        const nextLayerId = this.getNextLayerId(layers, layerModel.zIndex, position);
        const next = (metadata.position === 'top') ? null : nextLayerId;

        this.map.addLayer(l, next);

        layers.forEach((layer) => {
          this.setZIndex(layer, layer.zIndex, layers);
        });
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
  getNextLayerId(layers, zIndex, position) {
    if (position === 'top') {
      return null;
    }

    const layersOnMap = this.getLayersOnMap();

    const customLayer = layersOnMap && layersOnMap.length && layersOnMap.find(l => l.id.includes('custom-layers') || l.id.includes('label') || l.id.includes('place') || l.id.includes('poi'));

    const sortedLayers = sortBy(layers, l => l.zIndex);
    const nextLayer = sortedLayers.find(l => l.zIndex > zIndex);

    if (!nextLayer || (!!nextLayer && !nextLayer.mapLayer)) {
      return customLayer.id;
    }

    const nextLayerMapLayers = nextLayer.mapLayer.layers;
    const nextLayerId = nextLayerMapLayers[nextLayerMapLayers.length - 1].id;

    return layersOnMap.find(l => nextLayerId === l.id) ? nextLayerId : customLayer.id;
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   * @param {Number} zIndex
   * @param {Array} layers
   */
  setZIndex(layerModel, zIndex, layers) {
    const { mapLayer } = layerModel;

    if (!mapLayer) {
      return false;
    }

    const { layers: mapLayers } = mapLayer;
    const layersOnMap = this.getLayersOnMap();
    const layersOnMapIds = layersOnMap.map(l => l.id);
    const layersToSetIndex = layersOnMap.filter((l) => {
      const { id = {} } = l;
      const ids = mapLayers.map(ly => ly.id);

      return ids.includes(id);
    });

    const rasterDecodeId = `${layerModel.id}-raster`;
    if (layerModel.decodeFunction && layersOnMapIds.includes(rasterDecodeId)) {
      layersToSetIndex.push({ id: `${rasterDecodeId}-decode` });
    }

    if (layersToSetIndex && layersToSetIndex.length) {
      layersToSetIndex.forEach((l) => {
        const { id, metadata = {} } = l;
        const { position } = metadata;
        const nextLayerId = this.getNextLayerId(layers, zIndex, position);
        const next = (metadata.position === 'top') ? null : nextLayerId;

        this.map.moveLayer(id, next);
      });
    }

    return true;
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const PAINT_STYLE_NAMES = {
      symbol: ['icon', 'text'],
      circle: ['circle', 'circle-stroke']
    };

    const { layerConfig, mapLayer, decodeFunction } = layerModel;
    const { body } = layerConfig;
    const { vectorLayers = [] } = body;

    if (mapLayer.layers && !decodeFunction) {
      mapLayer.layers.forEach((l) => {
        // Select the style to change depending on the type of layer
        const paintStyleNames = PAINT_STYLE_NAMES[l.type] || [l.type];

        // Select the paint property from the original layer
        const { paint = {} } = (vectorLayers.find(v => v.id === l.id) || {});

        // Loop each style name and check if there is an opacity in the original layer
        paintStyleNames.forEach((name) => {
          const paintOpacity = paint[`${name}-opacity`] || 1;
          this.map.setPaintProperty(l.id, `${name}-opacity`, paintOpacity * opacity);
        });
      });
    }

    if (decodeFunction) {
      const layer = mapLayer.layers[0];

      if (layer && typeof layer.setProps === 'function') {
        layer.setProps({ opacity });
      }
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

    const layer = mapLayer.layers[0];

    if (layer && typeof layer.setProps === 'function') {
      layer.setProps({ decodeParams });
    } else {
      console.error('Layer is not present. You defined decodeParams but maybe you didn\'t define a decodeFunction');
    }

    return this;
  }
}

export default PluginMapboxGL;
