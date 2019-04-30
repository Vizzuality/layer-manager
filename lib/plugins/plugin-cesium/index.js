'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _cartoLayerCesium = require('./carto-layer-cesium');

var _cartoLayerCesium2 = _interopRequireDefault(_cartoLayerCesium);

var _tileLayerCesium = require('./tile-layer-cesium');

var _tileLayerCesium2 = _interopRequireDefault(_tileLayerCesium);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PluginCesium = function () {
  function PluginCesium(map) {
    _classCallCheck(this, PluginCesium);

    _initialiseProps.call(this);

    var Cesium = PluginCesium.Cesium;

    this.map = map;
    this.eventListener = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);

    this.method = {
      carto: (0, _cartoLayerCesium2.default)(Cesium),
      cartodb: (0, _cartoLayerCesium2.default)(Cesium),
      cesium: (0, _tileLayerCesium2.default)(Cesium)
    };
  }

  _createClass(PluginCesium, [{
    key: 'add',
    value: function add(layerModel) {
      var mapLayer = layerModel.mapLayer;

      this.map.imageryLayers.add(mapLayer);
    }
  }, {
    key: 'remove',
    value: function remove(layerModel) {
      var mapLayer = layerModel.mapLayer;

      this.map.imageryLayers.remove(mapLayer, true);
      this.eventListener.destroy();
    }
  }, {
    key: 'getLayerByProvider',
    value: function getLayerByProvider(provider) {
      return this.method[provider];
    }
  }, {
    key: 'setZIndex',
    value: function setZIndex(layerModel, zIndex) {
      var length = this.map.imageryLayers.length;
      var mapLayer = layerModel.mapLayer;

      var layerIndex = zIndex >= length ? length - 1 : zIndex;
      var nextIndex = zIndex < 0 ? 0 : layerIndex;
      var currentIndex = this.map.imageryLayers.indexOf(mapLayer);
      if (currentIndex !== nextIndex) {
        var steps = nextIndex - currentIndex;
        for (var i = 0; i < Math.abs(steps); i++) {
          if (steps > 0) {
            this.map.imageryLayers.raise(mapLayer);
          } else {
            this.map.imageryLayers.lower(mapLayer);
          }
        }
      }
      return this;
    }
  }, {
    key: 'setOpacity',
    value: function setOpacity(layerModel, opacity) {
      var mapLayer = layerModel.mapLayer;

      mapLayer.alpha = opacity;
      return this;
    }
  }, {
    key: 'setVisibility',
    value: function setVisibility(layerModel, visibility) {
      var mapLayer = layerModel.mapLayer;

      mapLayer.show = visibility;
      return this;
    }
  }, {
    key: 'setEvents',
    value: function setEvents(layerModel) {
      var _this = this;

      var events = layerModel.events;

      Object.keys(events).forEach(function (type) {
        var action = events[type];
        if (_this.eventListener.getInputAction(type)) {
          _this.eventListener.removeInputAction(type);
        }
        _this.eventListener.setInputAction(_this.getCoordinatesFromEvent(action), type);
      });
      return this;
    }
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
      console.info('Decode params callback', layerModel, this);
    }
  }]);

  return PluginCesium;
}();

PluginCesium.Cesium = typeof window !== 'undefined' ? window.Cesium : null;

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.getCoordinatesFromEvent = function (action) {
    return function (event) {
      var position = event.position;
      var Cesium = PluginCesium.Cesium;

      var clicked = new Cesium.Cartesian2(position.x, position.y);
      var ellipsoid = _this2.map.scene.globe.ellipsoid;

      var cartesian = _this2.map.camera.pickEllipsoid(clicked, ellipsoid);
      if (cartesian) {
        var cartographic = ellipsoid.cartesianToCartographic(cartesian);
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        action(event, { lat: lat, lng: lng });
      }
    };
  };
};

exports.default = PluginCesium;