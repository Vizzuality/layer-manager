'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _utfGridLayerLeaflet = require('./utf-grid-layer-leaflet');

var _utfGridLayerLeaflet2 = _interopRequireDefault(_utfGridLayerLeaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var maxBounds = L && new L.LatLngBounds(new L.LatLng(49.496674527470455, -66.357421875), new L.LatLng(24.607069137709683, -131.66015625));

var LOCALayer = function LOCALayer(layerModel) {
  var id = layerModel.id,
      layerConfig = layerModel.layerConfig,
      interactivity = layerModel.interactivity;
  var period = layerConfig.period;

  var year = (period || {}).value || '1971';
  var dateString = new Date(year).toISOString();
  var tileUrl = 'https://api.resourcewatch.org/v1/layer/' + id + '/tile/loca/{z}/{x}/{y}?year=' + dateString;

  var layer = L.tileLayer(tileUrl, Object.assign({}, layerConfig.body, {
    minNativeZoom: 4,
    bounds: maxBounds
  }));

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

exports.default = LOCALayer;