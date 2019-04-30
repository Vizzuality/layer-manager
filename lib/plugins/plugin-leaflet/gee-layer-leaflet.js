'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _query = require('../../utils/query');

var _canvasLayerLeaflet = require('./canvas-layer-leaflet');

var _canvasLayerLeaflet2 = _interopRequireDefault(_canvasLayerLeaflet);

var _utfGridLayerLeaflet = require('./utf-grid-layer-leaflet');

var _utfGridLayerLeaflet2 = _interopRequireDefault(_utfGridLayerLeaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var GEELayer = function GEELayer(layerModel) {
  if (!L) throw new Error('Leaflet must be defined.');

  var id = layerModel.id,
      layerConfig = layerModel.layerConfig,
      interactivity = layerModel.interactivity,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams,
      decodeParams = layerModel.decodeParams;

  var tileUrl = 'https://api.resourcewatch.org/v1/layer/' + id + '/tile/gee/{z}/{x}/{y}';
  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));
  var layer = void 0;

  switch (layerConfigParsed.type) {
    case 'tileLayer':
      if (decodeParams) {
        layer = new _canvasLayerLeaflet2.default(Object.assign({}, layerModel));
      } else {
        layer = L.tileLayer(tileUrl, layerConfigParsed.body);
      }
      break;
    default:
      layer = L.tileLayer(tileUrl, layerConfigParsed.body);
      break;
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

  return new Promise(function (resolve, reject) {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

exports.default = GEELayer;