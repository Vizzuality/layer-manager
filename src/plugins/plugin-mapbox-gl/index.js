
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
      const nextLayerId = this.getNextLayerId(layers, layerModel.zIndex);

      mapLayer.layers.forEach((l) => {
        const { metadata = {} } = l;
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
  getNextLayerId(layers, zIndex) {
    const layersOnMap = this.getLayersOnMap();
    const layersOnMapIds = layersOnMap.map(l => l.id);
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

    const customLayerId = layersOnMap && layersOnMap.length && layersOnMap.find(l => l.id.includes('custom-layers') || l.id.includes('label') || l.id.includes('place') || l.id.includes('poi'));

    const nextLayer = sortedLayers.find(l => l.zIndex > zIndex) || customLayerId;

    // TODO: ED BRETT should explain what is is this
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
      layersToSetIndex.forEach((l) => {
        const { id, metadata = {} } = l;
        const next = (metadata.position === 'top') ? null : nextLayerId;

        this.map.moveLayer(id, next);
      });
    }
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
    const { vectorLayers } = body;

    if (mapLayer.layers && !decodeFunction) {
      mapLayer.layers.forEach((l) => {
        // Select the style to change depending on the type of layer
        const paintStyleNames = PAINT_STYLE_NAMES[l.type] || [l.type];

        // Select the paint property from the original layer
        const { paint = {} } = vectorLayers.find(v => v.id === l.id);

        // Loop each style name and check if there is an opacity in the original layer
        paintStyleNames.forEach((name) => {
          const paintOpacity = paint[`${name}-opacity`] || 1;
          this.map.setPaintProperty(l.id, `${name}-opacity`, paintOpacity * opacity);
        });
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
