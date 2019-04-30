'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _query = require('../../utils/query');

var _leafletLayerLeaflet = require('./leaflet-layer-leaflet');

var _leafletLayerLeaflet2 = _interopRequireDefault(_leafletLayerLeaflet);

var _utfGridLayerLeaflet = require('./utf-grid-layer-leaflet');

var _utfGridLayerLeaflet2 = _interopRequireDefault(_utfGridLayerLeaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L; /* eslint no-underscore-dangle: ["error", { "allow": ["_currentImage", "_image"] }] */


var eval2 = eval;

var EsriLayer = function EsriLayer(layerModel) {
  if (!L) throw new Error('Leaflet must be defined.');
  if (!L.esri) {
    throw new Error('To support this layer you should add esri library for Leaflet.');
  }

  // Preparing layerConfig
  var layerConfig = layerModel.layerConfig,
      interactivity = layerModel.interactivity,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams;

  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  var bodyStringified = JSON.stringify(layerConfigParsed.body || {}).replace(/"mosaic-rule":/g, '"mosaicRule":').replace(/"mosaic_rule":/g, '"mosaicRule":').replace(/"use-cors":/g, '"useCors":').replace(/"use_cors":/g, '"useCors":');

  // If type is a method of leaflet, returns LeafletLayer
  if (L[layerConfigParsed.type]) return new _leafletLayerLeaflet2.default(Object.assign({}, layerModel));

  return new Promise(function (resolve, reject) {
    if (!L.esri[layerConfigParsed.type]) {
      return reject(new Error('"type" specified in layer spec doesn`t exist'));
    }

    var layerOptions = JSON.parse(bodyStringified);
    layerOptions.pane = 'tilePane';
    layerOptions.useCors = true;
    // forcing cors
    if (layerOptions.style && layerOptions.style.indexOf('function') >= 0) {
      layerOptions.style = eval2('(' + layerOptions.style + ')');
    }

    var layer = void 0;

    layer = L.esri[layerConfigParsed.type](layerOptions);

    if (layer) {
      // Little hack to set zIndex at the beginning
      layer.on('load', function () {
        layer.setZIndex(layerModel.zIndex);
      });

      layer.on('requesterror', function (err) {
        return console.error(err);
      });
    } else {
      return reject();
    }

    if (!layer.setZIndex) {
      layer.setZIndex = function (zIndex) {
        if (layer._currentImage) {
          layer._currentImage._image.style.zIndex = zIndex;
        }
      };
    }

    // Add interactivity
    if (interactivity) {
      var interactiveLayer = new _utfGridLayerLeaflet2.default();

      var LayerGroup = L.LayerGroup.extend({
        group: true,
        setOpacity: function setOpacity(opacity) {
          layerModel.mapLayer.getLayers().forEach(function (l) {
            l.setOpacity(opacity);
          });
        }
      });

      layer = new LayerGroup([layer, interactiveLayer]);
    }

    return resolve(layer);
  });
};

exports.default = EsriLayer;