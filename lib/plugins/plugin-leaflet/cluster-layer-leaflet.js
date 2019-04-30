'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _clusterService = require('../../services/cluster-service');

var _supercluster = require('supercluster');

var _supercluster2 = _interopRequireDefault(_supercluster);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /* eslint no-underscore-dangle: 0 */


var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var defaultSizes = {
  50: 25,
  100: 30,
  1000: 40
};

var ClusterLayer = L && L.GeoJSON.extend({
  initialize: function initialize(layerModel) {
    var _this = this;

    var self = this;
    L.GeoJSON.prototype.initialize.call(this, []);
    var layerConfig = layerModel.layerConfig,
        events = layerModel.events,
        decodeClusters = layerModel.decodeClusters;

    if (!decodeClusters) {
      console.warn('You must provide a decodeClusters function');
      return;
    }

    var _ref2 = layerModel.layerConfig || {},
        html = _ref2.html,
        _ref2$sizes = _ref2.sizes,
        sizes = _ref2$sizes === undefined ? defaultSizes : _ref2$sizes,
        clusterIcon = _ref2.clusterIcon,
        icon = _ref2.icon;

    L.Util.setOptions(this, {
      // converts feature to icon
      pointToLayer: function pointToLayer(feature, latlng) {
        var isCluster = feature.properties && feature.properties.cluster;

        // if cluster return point icon
        if (!isCluster) {
          // see documentation for icon config https://leafletjs.com/reference-1.3.4.html#icon
          return L.marker(latlng, { icon: L.icon(Object.assign({ iconSize: [35, 35] }, icon)) });
        }

        var count = feature.properties.point_count;
        var iconSize = null;

        if (typeof sizes === 'function') {
          iconSize = function iconSize() {
            return sizes(count);
          };
        } else {
          var sizeKey = Object.keys(sizes).find(function (o) {
            return count <= parseInt(o, 10);
          });
          var size = sizes[sizeKey];
          iconSize = L.point(size, size);
        }

        // see documentation for icon config https://leafletjs.com/reference-1.3.4.html#divicon
        return L.marker(latlng, {
          icon: L.divIcon(Object.assign({
            iconSize: iconSize,
            html: html && typeof html === 'function' ? html(feature) : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; ' + (clusterIcon.color ? 'background-color: ' + clusterIcon.color + ';' : '') + '">' + feature.properties.point_count_abbreviated + '</div>'
          }, clusterIcon))
        });
      },


      // parses each feature before adding to the map
      onEachFeature: function onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.cluster) {
          layer.on({
            click: function click() {
              return self.setMapView(feature);
            }
          });
        } else if (events) {
          layer.on(Object.keys(events).reduce(function (obj, event) {
            return Object.assign({}, obj, _defineProperty({}, event, function (e) {
              return events[event](Object.assign({}, e, { data: feature.properties }));
            }));
          }, {}));
        }
      }
    });

    // https://github.com/mapbox/supercluster options available here

    var _ref3 = layerConfig || {},
        clusterConfig = _ref3.clusterConfig;

    this.supercluster = (0, _supercluster2.default)(Object.assign({
      radius: 80,
      maxZoom: 16
    }, clusterConfig));

    (0, _clusterService.fetchData)(layerModel).then(function (response) {
      var features = decodeClusters(response);
      _this.supercluster.load(features);
      _this.update();
    });
  },
  setMapView: function setMapView(feature) {
    var center = feature.geometry.coordinates;
    var zoom = this.supercluster.getClusterExpansionZoom(feature.properties.cluster_id);
    this._map.setView(center.reverse(), zoom);
  },
  onAdd: function onAdd(map) {
    L.GeoJSON.prototype.onAdd.call(this, map);
    map.on('moveend zoomend', this.onMove, this);
  },
  onRemove: function onRemove(map) {
    map.off('moveend zoomend', this.onMove, this);
    this.clear();
  },
  onMove: function onMove() {
    this.clear();
    this.update();
  },
  update: function update() {
    var zoom = this._map.getZoom();
    var bounds = this._map.getBounds();
    var clusterBounds = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat];
    var clusters = this.supercluster.getClusters(clusterBounds, zoom);
    this.addData(clusters);
  },
  clear: function clear() {
    L.GeoJSON.prototype.clearLayers.call(this, []);
  }
});

exports.default = ClusterLayer;