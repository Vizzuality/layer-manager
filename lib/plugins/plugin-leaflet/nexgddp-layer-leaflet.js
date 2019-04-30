'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utfGridLayerLeaflet = require('./utf-grid-layer-leaflet');

var _utfGridLayerLeaflet2 = _interopRequireDefault(_utfGridLayerLeaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var NEXGDDPLayer = function NEXGDDPLayer(layerModel) {
  var id = layerModel.id,
      layerConfig = layerModel.layerConfig,
      interactivity = layerModel.interactivity;
  var period = layerConfig.period;

  var year = (period || {}).value || '1971-01-01';
  var dateString = new Date(year).toISOString();
  var tileUrl = 'https://api.resourcewatch.org/v1/layer/' + id + '/tile/nexgddp/{z}/{x}/{y}?year=' + dateString;

  var layer = L.tileLayer(tileUrl, layerConfig.body);

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

  return new Promise(function (resolve) {
    resolve(layer);
  });
};

exports.default = NEXGDDPLayer;