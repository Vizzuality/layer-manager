import rasterLayer from './raster-layer-mapbox-gl';
import cartoLayer from './carto-layer-mapbox-gl';

class PluginMapboxGL {
  constructor(map) {
    this.map = map;
  }

  events = {};

  method = {
    leaflet: rasterLayer,
    cartodb: cartoLayer
  };

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel) {
    const { mapLayer } = layerModel;
    this.map.addSource(mapLayer.id, mapLayer.source);
    this.map.addLayer(mapLayer.layer);
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel) {
    const { mapLayer, events } = layerModel;

    // if (events && mapLayer) {
    //   Object.keys(events).forEach((k) => {
    //     if (mapLayer.group) {
    //       mapLayer.eachLayer((l) => {
    //         l.off(k);
    //       });
    //     } else {
    //       mapLayer.off(k);
    //     }
    //   });
    // }

    if (mapLayer) {
      this.map.removeLayer(mapLayer);
    }
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
    const { mapLayer } = layerModel;

    // mapLayer.setZIndex(zIndex);

    return this;
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const { mapLayer } = layerModel;

    if (typeof mapLayer.setOpacity === 'function') {
      mapLayer.setOpacity(opacity);
    }

    if (typeof mapLayer.setStyle === 'function') {
      mapLayer.setStyle({ opacity });
    }

    return this;
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    const { opacity } = layerModel;

    this.setOpacity(layerModel, !visibility ? 0 : opacity);
  }

  /**
   * A namespace to set DOM events
   * @param {Object} layerModel
  */
  setEvents = (layerModel) => {
    const { mapLayer, events } = layerModel;
    if (layerModel.layerConfig.type !== 'cluster') {
      // Remove current events
      if (this.events[layerModel.id]) {
        Object.keys(this.events[layerModel.id]).forEach((k) => {
          if (mapLayer.group) {
            mapLayer.eachLayer((l) => {
              l.off(k);
            });
          } else {
            mapLayer.off(k);
          }
        });
      }

      // Add new events
      Object.keys(events).forEach((k) => {
        if (mapLayer.group) {
          mapLayer.eachLayer((l) => {
            l.on(k, events[k]);
          });
        } else {
          this.map.on(k, mapLayer.id, events[k]);
        }
      });
      // Set this.events equal to current ones
      this.events[layerModel.id] = events;
    }

    return this;
  };

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
