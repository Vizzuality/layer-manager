
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
      const layers = this.getLayers();

      layers.forEach(layer => this.add(layer));
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
  add(layerModel) {
    const { mapLayer } = layerModel;
    const layers = this.getLayers();

    // remove old source
    if (this.map && mapLayer && mapLayer.id && this.map.getSource(mapLayer.id)) {
      this.map.removeSource(mapLayer.id);
    }

    // add source if it has one
    if (this.map && mapLayer && mapLayer.source && mapLayer.id) {
      this.map.addSource(mapLayer.id, mapLayer.source);
    }

    // add layers
    if (mapLayer && mapLayer.layers) {
      mapLayer.layers.forEach((l) => {
        const { metadata = {} } = l;
        const nextLayerId = (metadata.position === 'top') ? null : this.getNextLayerId(layerModel);
        this.map.addLayer(l, nextLayerId);

        // if we don't find the next layer id, we should also set all layers zIndex again
        layers.forEach((layer) => {
          this.setZIndex(layer);
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
   * Get all layers passed to layer manager
   */
  getLayers() {
    const { getLayers } = this.options;
    const layers = getLayers();
    return sortBy(layers, l => l.decodeFunction);
  }

  /**
   * Get the layer above the given z-index
   * @param {Object} layerModel
   */
  getNextLayerId(layerModel) {
    const { zIndex } = layerModel;
    const allLayers = this.getLayers();
    const layersOnMap = this.getLayersOnMap();

    // find the top layer for placing data layers below
    const customLayer = layersOnMap && layersOnMap.length && layersOnMap.find(l => l.id.includes('custom-layers') || l.id.includes('label') || l.id.includes('place') || l.id.includes('poi'));

    // make sure layers are sorted by zIndex
    const sortedLayers = sortBy(allLayers, l => l.zIndex);

    // get the layer with zIndex greater than current layer from all layers
    // if next layer is a decode layer we cannot add the layer below it, so need need to add it below the layer ahove that.
    const nextLayer = sortedLayers.find(l => l.zIndex > zIndex);

    // if no layer above it then use the custom layer
    if (!nextLayer || (!!nextLayer && !nextLayer.mapLayer)) {
      return customLayer.id;
    }

    // get the first layer of the next layer's array
    const nextLayerMapLayers = nextLayer.mapLayer.layers;
    const nextLayerId = nextLayerMapLayers[0].id;

    // if it has a layer above it, check if that layer has been added to the map and get its id
    const isNextLayerOnMap = !!layersOnMap.find(l => nextLayerId === l.id);

    // if next layer is on map return the id, else return the custom layer to add below
    return isNextLayerOnMap ? nextLayerId : customLayer.id;
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   */
  setZIndex() {
    // const { mapLayer, zIndex } = layerModel;
    // if (!mapLayer) {
    //   return false;
    // }

    const allLayers = this.getLayers();
    const layersOnMap = this.getLayersOnMap();
    // const { layers } = mapLayer;

    // // const layersOnMapIds = layersOnMap.map(l => l.id);
    // const layersToSetIndex = layersOnMap.filter((l) => {
    //   const { id = {} } = l;
    //   const ids = mapLayers.map(ly => ly.id);

    //   return ids.includes(id);
    // });

    // const rasterDecodeId = `${layerModel.id}-raster-decode`;
    // if (layerModel.decodeFunction) {
    //   layersToSetIndex.push({ id: rasterDecodeId });
    // }

    // if (layersToSetIndex && layersToSetIndex.length) {
    layersOnMap.forEach((l) => {
      const { id, metadata = {} } = l;
      const layerModel = allLayers.find(ly => id.includes(ly.id));
      if (layerModel) {
        const nextLayerId = (metadata.position === 'top') ? null : this.getNextLayerId(layerModel);
        this.map.moveLayer(id, nextLayerId);
      }
    });

    const decodeLayers = allLayers.filter(l => !!l.decodeFunction);

    if (decodeLayers) {
      decodeLayers.forEach((l) => {
        const isDecodeLayerAdded = layersOnMap.find(ly => ly.id === `${l.id}-raster-decode-bg`);
        console.log(isDecodeLayerAdded);
        if (isDecodeLayerAdded) {
          const nextLayerId = this.getNextLayerId(l);
          this.map.moveLayer(`${l.id}-raster-decode`, nextLayerId);
        }
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
          this.map.setPaintProperty(l.id, `${name}-opacity`, paintOpacity * opacity * 0.99);
        });
      });
    }

    if (decodeFunction) {
      const layer = mapLayer.layers[1];

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

    const layer = mapLayer.layers[1];

    if (layer && typeof layer.setProps === 'function') {
      layer.setProps({ decodeParams });
    } else {
      console.error('Layer is not present. You defined decodeParams but maybe you didn\'t define a decodeFunction');
    }

    return this;
  }
}

export default PluginMapboxGL;
