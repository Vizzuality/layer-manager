'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cartoLayerLeaflet = require('./carto-layer-leaflet');

var _cartoLayerLeaflet2 = _interopRequireDefault(_cartoLayerLeaflet);

var _esriLayerLeaflet = require('./esri-layer-leaflet');

var _esriLayerLeaflet2 = _interopRequireDefault(_esriLayerLeaflet);

var _geeLayerLeaflet = require('./gee-layer-leaflet');

var _geeLayerLeaflet2 = _interopRequireDefault(_geeLayerLeaflet);

var _locaLayerLeaflet = require('./loca-layer-leaflet');

var _locaLayerLeaflet2 = _interopRequireDefault(_locaLayerLeaflet);

var _nexgddpLayerLeaflet = require('./nexgddp-layer-leaflet');

var _nexgddpLayerLeaflet2 = _interopRequireDefault(_nexgddpLayerLeaflet);

var _leafletLayerLeaflet = require('./leaflet-layer-leaflet');

var _leafletLayerLeaflet2 = _interopRequireDefault(_leafletLayerLeaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PluginLeaflet = function () {
  function PluginLeaflet(map) {
    var _this = this;

    _classCallCheck(this, PluginLeaflet);

    this.events = {};
    this.method = {
      // CARTO
      cartodb: _cartoLayerLeaflet2.default,
      carto: _cartoLayerLeaflet2.default,
      raster: _cartoLayerLeaflet2.default,
      // ESRI
      arcgis: _esriLayerLeaflet2.default,
      featureservice: _esriLayerLeaflet2.default,
      mapservice: _esriLayerLeaflet2.default,
      tileservice: _esriLayerLeaflet2.default,
      esrifeatureservice: _esriLayerLeaflet2.default,
      esrimapservice: _esriLayerLeaflet2.default,
      esritileservice: _esriLayerLeaflet2.default,
      // GEE && LOCA && NEXGDDP
      gee: _geeLayerLeaflet2.default,
      loca: _locaLayerLeaflet2.default,
      nexgddp: _nexgddpLayerLeaflet2.default,
      // LEAFLET
      leaflet: _leafletLayerLeaflet2.default,
      wms: _leafletLayerLeaflet2.default
    };

    this.setEvents = function (layerModel) {
      var mapLayer = layerModel.mapLayer,
          events = layerModel.events;

      if (layerModel.layerConfig.type !== 'cluster') {
        // Remove current events
        if (_this.events[layerModel.id]) {
          Object.keys(_this.events[layerModel.id]).forEach(function (k) {
            if (mapLayer.group) {
              mapLayer.eachLayer(function (l) {
                l.off(k);
              });
            } else {
              mapLayer.off(k);
            }
          });
        }

        // Add new events
        Object.keys(events).forEach(function (k) {
          if (mapLayer.group) {
            mapLayer.eachLayer(function (l) {
              l.on(k, events[k]);
            });
          } else {
            mapLayer.on(k, events[k]);
          }
        });
        // Set this.events equal to current ones
        _this.events[layerModel.id] = events;
      }

      return _this;
    };

    this.fitMapToLayer = function (layerModel) {
      var bounds = layerModel.get('mapLayerBounds');

      if (bounds) {
        _this.map.fitBounds(bounds);
      }
    };

    this.map = map;
  }

  _createClass(PluginLeaflet, [{
    key: 'add',


    /**
     * Add a layer
     * @param {Object} layerModel
     */
    value: function add(layerModel) {
      var mapLayer = layerModel.mapLayer;


      this.map.addLayer(mapLayer);
    }

    /**
     * Remove a layer
     * @param {Object} layerModel
     */

  }, {
    key: 'remove',
    value: function remove(layerModel) {
      var mapLayer = layerModel.mapLayer,
          events = layerModel.events;


      if (events && mapLayer) {
        Object.keys(events).forEach(function (k) {
          if (mapLayer.group) {
            mapLayer.eachLayer(function (l) {
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

  }, {
    key: 'getLayerByProvider',
    value: function getLayerByProvider(provider) {
      return this.method[provider];
    }

    /**
     * A request to layer bounds
     */

  }, {
    key: 'getLayerBoundsByProvider',
    value: function getLayerBoundsByProvider(provider) {
      return this.method[provider].getBounds;
    }

    /**
     * A namespace to set z-index
     * @param {Object} layerModel
     * @param {Number} zIndex
     */

  }, {
    key: 'setZIndex',
    value: function setZIndex(layerModel, zIndex) {
      var mapLayer = layerModel.mapLayer;


      mapLayer.setZIndex(zIndex);

      return this;
    }

    /**
     * A namespace to set opacity
     * @param {Object} layerModel
     * @param {Number} opacity
     */

  }, {
    key: 'setOpacity',
    value: function setOpacity(layerModel, opacity) {
      var mapLayer = layerModel.mapLayer;


      if (typeof mapLayer.setOpacity === 'function') {
        mapLayer.setOpacity(opacity);
      }

      if (typeof mapLayer.setStyle === 'function') {
        mapLayer.setStyle({ opacity: opacity });
      }

      return this;
    }

    /**
     * A namespace to hide or show a selected layer
     * @param {Object} layerModel
     * @param {Boolean} visibility
     */

  }, {
    key: 'setVisibility',
    value: function setVisibility(layerModel, visibility) {
      var opacity = layerModel.opacity;


      this.setOpacity(layerModel, !visibility ? 0 : opacity);
    }

    /**
     * A namespace to set DOM events
     * @param {Object} layerModel
    */

  }, {
    key: 'setParams',
    value: function setParams(layerModel) {
      this.remove(layerModel);
    }
  }, {
    key: 'setLayerConfig',
    value: function setLayerConfig(layerModel) {
      this.remove(layerModel);
    }
  }, {
    key: 'setDecodeParams',
    value: function setDecodeParams(layerModel) {
      var mapLayer = layerModel.mapLayer,
          params = layerModel.params,
          sqlParams = layerModel.sqlParams,
          decodeParams = layerModel.decodeParams,
          decodeFunction = layerModel.decodeFunction;


      mapLayer.reDraw({ decodeParams: decodeParams, decodeFunction: decodeFunction, params: params, sqlParams: sqlParams });

      return this;
    }
  }]);

  return PluginLeaflet;
}();

exports.default = PluginLeaflet;