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

  events = {}

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
    leaflet: leafletLayer
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
      Object.keys(events).forEach((k) => {
        if (mapLayer.group) {
          mapLayer.eachLayer((l) => {
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
    
    if (mapLayer.setOpacity) {
      mapLayer.setOpacity(opacity);
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
  setEvents(layerModel) {
    const { mapLayer, events } = layerModel;

    // Remove current events
    Object.keys(this.events).forEach((k) => {
      if (mapLayer.group) {
        mapLayer.eachLayer((l) => {
          l.off(k);
        });
      } else {
        mapLayer.off(k);
      }
    });

    // Add new events
    Object.keys(events).forEach((k) => {
      if (mapLayer.group) {
        mapLayer.eachLayer((l) => {
          l.on(k, events[k]);
        });
      } else {
        mapLayer.on(k, events[k]);
        console.log(mapLayer);
      }
    });

    // Set this.events equal to current ones
    this.events = events;

    return this;
  }

  setParams(layerModel) {
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

    mapLayer.reDraw({ params, sqlParams, decodeParams, decodeFunction });

    return this;
  }
}

export default PluginLeaflet;
