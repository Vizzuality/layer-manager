import debounce from 'lodash-es/debounce';

import cartoLayer from './carto-layer-leaflet';
import esriLayer from './esri-layer-leaflet';
import geeLayer from './gee-layer-leaflet';
import locaLayer from './loca-layer-leaflet';
import nexgddpLayer from './nexgddp-layer-leaflet';
import leafletLayer from './leaflet-layer-leaflet';

class PluginLeaflet {
  constructor(map) {
    this.map = map;
  }

  events = {};

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
    // GEE && LOCA && NEXGDDP
    gee: geeLayer,
    loca: locaLayer,
    nexgddp: nexgddpLayer,
    // LEAFLET
    leaflet: leafletLayer,
    wms: leafletLayer
  };

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel) {
    const { mapLayer } = layerModel;

    this.map.addLayer(mapLayer);
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel) {
    const { mapLayer, events } = layerModel;

    if (events && mapLayer) {
      Object.keys(events).forEach(k => {
        if (mapLayer.group) {
          mapLayer.eachLayer(l => {
            l.off(k);
          });
        } else {
          mapLayer.off(k);
        }
      });
    }

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

    mapLayer.setZIndex(zIndex);

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
  setEvents = debounce(
    layerModel => {
      const { mapLayer, events } = layerModel;
      if (layerModel.layerConfig.type !== 'cluster') {
        // Remove current events
        if (this.events[layerModel.id]) {
          Object.keys(this.events[layerModel.id]).forEach(k => {
            if (mapLayer.group) {
              mapLayer.eachLayer(l => {
                l.off(k);
              });
            } else {
              mapLayer.off(k);
            }
          });
        }

        // Add new events
        Object.keys(events).forEach(k => {
          if (mapLayer.group) {
            mapLayer.eachLayer(l => {
              l.on(k, events[k]);
            });
          } else {
            mapLayer.on(k, events[k]);
          }
        });
        // Set this.events equal to current ones
        this.events[layerModel.id] = events;
      }

      return this;
    },
    200,
    { leading: true }
  );

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

export default PluginLeaflet;
