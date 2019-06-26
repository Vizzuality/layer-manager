'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _query = require('../../utils/query');

var _canvasLayerLeaflet = require('./canvas-layer-leaflet');

var _canvasLayerLeaflet2 = _interopRequireDefault(_canvasLayerLeaflet);

var _clusterLayerLeaflet = require('./cluster-layer-leaflet');

var _clusterLayerLeaflet2 = _interopRequireDefault(_clusterLayerLeaflet);

var _utfGridLayerLeaflet = require('./utf-grid-layer-leaflet');

var _utfGridLayerLeaflet2 = _interopRequireDefault(_utfGridLayerLeaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var eval2 = eval;

var LeafletLayer = function LeafletLayer(layerModel) {
  if (!L) throw new Error('Leaflet must be defined.');

  var layerConfig = layerModel.layerConfig,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams,
      decodeParams = layerModel.decodeParams,
      interactivity = layerModel.interactivity;

  var layer = void 0;

  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  // Transforming data layer
  if (layerConfigParsed.body.crs && L.CRS[layerConfigParsed.body.crs]) {
    layerConfigParsed.body.crs = L.CRS[layerConfigParsed.body.crs.replace(':', '')];
    layerConfigParsed.body.pane = 'tilePane';
  }

  switch (layerConfigParsed.type) {
    case 'wms':
      layer = L.tileLayer.wms(layerConfigParsed.url || layerConfigParsed.body.url, layerConfigParsed.body);
      break;
    case 'tileLayer':
      if (JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0) {
        layerConfigParsed.body.style = eval2('(' + layerConfigParsed.body.style + ')');
      }
      if (decodeParams && layerConfigParsed.canvas) {
        layer = new _canvasLayerLeaflet2.default(Object.assign({}, layerModel));
      } else {
        layer = L.tileLayer(layerConfigParsed.url || layerConfigParsed.body.url, layerConfigParsed.body);
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

      break;
    case 'cluster':
      if (JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0) {
        layerConfigParsed.body.style = eval2('(' + layerConfigParsed.body.style + ')');
      }
      layer = new _clusterLayerLeaflet2.default(layerModel);
      break;
    default:
      layer = L[layerConfigParsed.type](layerConfigParsed.body, layerConfigParsed.options || {});
      break;
  }

  return new Promise(function (resolve, reject) {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

LeafletLayer.getBounds = function (layerModel) {
  if (!L) throw new Error('Leaflet must be defined.');

  var layerConfig = layerModel.layerConfig,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams;


  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  var bbox = layerConfigParsed.bbox;


  return new Promise(function (resolve) {
    if (bbox) {
      var bounds = [[bbox[1], bbox[0]], [bbox[3], bbox[2]]];

      resolve(bounds);
    } else {
      resolve(null);
    }
  });
};

exports.default = LeafletLayer;