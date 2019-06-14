'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isEmpty = require('lodash/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _layerModel = require('./layer-model');

var _layerModel2 = _interopRequireDefault(_layerModel);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function checkPluginProperties(plugin) {
  if (plugin) {
    var requiredProperties = ['add', 'remove', 'setVisibility', 'setOpacity', 'setEvents', 'setZIndex', 'setLayerConfig', 'setParams', 'setDecodeParams', 'getLayerByProvider'];

    requiredProperties.forEach(function (property) {
      if (!plugin[property]) {
        console.error('The ' + property + ' function is required for layer manager plugins');
      }
    });
  }
}

var LayerManager = function () {
  function LayerManager(map, Plugin) {
    var _this = this;

    _classCallCheck(this, LayerManager);

    this.fitMapToLayer = function (layerId) {
      if (typeof _this.plugin.fitMapToLayer !== 'function') {
        console.error('This plugin does not support fitting map bounds to layer yet.');
        return;
      }

      var layerModel = _this.layers.find(function (l) {
        return l.id === layerId;
      });

      if (layerModel) _this.plugin.fitMapToLayer(layerModel);
    };

    this.map = map;
    this.plugin = new Plugin(this.map);
    checkPluginProperties(this.plugin);
    this.layers = [];
    this.promises = {};
  }

  /**
   * Render layers
   */


  _createClass(LayerManager, [{
    key: 'renderLayers',
    value: function renderLayers() {
      var _this2 = this;

      if (this.layers.length > 0) {
        this.layers.forEach(function (layerModel) {
          var changedAttributes = layerModel.changedAttributes;
          var sqlParams = changedAttributes.sqlParams,
              params = changedAttributes.params,
              layerConfig = changedAttributes.layerConfig;

          var hasChanged = Object.keys(changedAttributes).length > 0;
          var shouldUpdate = sqlParams || params || layerConfig;

          if (!shouldUpdate) {
            // If layer exists and didn't change don't do anything
            if (layerModel.mapLayer && !hasChanged) {
              return false;
            }

            // In case has changed, just update it else if (
            if (layerModel.mapLayer && hasChanged) {
              return _this2.updateLayer(layerModel);
            }
          }

          if (layerModel.mapLayer && shouldUpdate) {
            _this2.updateLayer(layerModel);
          }

          // adds a new promise to `this.promises` every time it gets called
          _this2.requestLayer(layerModel);
          _this2.requestLayerBounds(layerModel);

          // reset changedAttributes
          return layerModel.set('changedAttributes', {});
        });

        if (Object.keys(this.promises).length === 0) {
          return Promise.resolve(this.layers);
        }

        return Promise.all(Object.values(this.promises)).then(function () {
          return _this2.layers;
        }).then(function () {
          _this2.promises = {};
        });
      }

      // By default it will return a empty layers
      return Promise.resolve(this.layers);
    }

    /**
     * Add layers
     * @param {Array} layers
     * @param {Object} layerOptions
     */

  }, {
    key: 'add',
    value: function add(layers) {
      var _this3 = this;

      var layerOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        opacity: 1,
        visibility: true,
        zIndex: 0,
        interactivity: null
      };

      if (typeof layers === 'undefined') {
        console.error('layers is required');
        return this;
      }

      if (!Array.isArray(layers)) {
        console.error('layers should be an array');
        return this;
      }

      layers.forEach(function (layer) {
        var existingLayer = _this3.layers.find(function (l) {
          return l.id === layer.id;
        });
        var nextModel = Object.assign({}, layer, layerOptions);

        if (existingLayer) {
          existingLayer.update(nextModel);
        } else {
          _this3.layers.push(new _layerModel2.default(nextModel));
        }
      });

      return this.layers;
    }

    /**
     * Updating a specific layer
     * @param  {Object} layerModel
     */

  }, {
    key: 'updateLayer',
    value: function updateLayer(layerModel) {
      var _layerModel$changedAt = layerModel.changedAttributes,
          opacity = _layerModel$changedAt.opacity,
          visibility = _layerModel$changedAt.visibility,
          zIndex = _layerModel$changedAt.zIndex,
          params = _layerModel$changedAt.params,
          sqlParams = _layerModel$changedAt.sqlParams,
          decodeParams = _layerModel$changedAt.decodeParams,
          layerConfig = _layerModel$changedAt.layerConfig,
          events = _layerModel$changedAt.events;


      if (typeof opacity !== 'undefined') {
        this.plugin.setOpacity(layerModel, opacity);
      }
      if (typeof visibility !== 'undefined') {
        this.plugin.setOpacity(layerModel, !visibility ? 0 : layerModel.opacity);
      }
      if (typeof zIndex !== 'undefined') {
        this.plugin.setZIndex(layerModel, zIndex);
      }
      if (typeof events !== 'undefined') {
        this.setEvents(layerModel);
      }

      if (!(0, _isEmpty2.default)(layerConfig)) this.plugin.setLayerConfig(layerModel);
      if (!(0, _isEmpty2.default)(params)) this.plugin.setParams(layerModel);
      if (!(0, _isEmpty2.default)(sqlParams)) this.plugin.setParams(layerModel);
      if (!(0, _isEmpty2.default)(decodeParams)) this.plugin.setDecodeParams(layerModel);
    }

    /**
     * Remove a layer giving a Layer ID
     * @param {Array} layerIds
     */

  }, {
    key: 'remove',
    value: function remove(layerIds) {
      var _this4 = this;

      var layers = this.layers.slice(0);
      var ids = Array.isArray(layerIds) ? layerIds : [layerIds];

      this.layers.forEach(function (layerModel, index) {
        if (ids) {
          if (ids.includes(layerModel.id)) {
            _this4.plugin.remove(layerModel);
            layers.splice(index, 1);
          }
        } else {
          _this4.plugin.remove(layerModel);
        }
      });

      this.layers = ids ? layers : [];
    }

    /**
     * A namespace to set opacity on selected layer
     * @param {Array} layerIds
     * @param {Number} opacity
     */

  }, {
    key: 'setOpacity',
    value: function setOpacity(layerIds, opacity) {
      var _this5 = this;

      var layerModels = this.layers.filter(function (l) {
        return layerIds.includes(l.id);
      });

      if (layerModels.length) {
        layerModels.forEach(function (lm) {
          _this5.plugin.setOpacity(lm, opacity);
        });
      } else {
        console.error("Can't find the layer");
      }
    }

    /**
     * A namespace to hide or show a selected layer
     * @param {Array} layerIds
     * @param {Boolean} visibility
     */

  }, {
    key: 'setVisibility',
    value: function setVisibility(layerIds, visibility) {
      var _this6 = this;

      var layerModels = this.layers.filter(function (l) {
        return layerIds.includes(l.id);
      });

      if (layerModels.length) {
        layerModels.forEach(function (lm) {
          _this6.plugin.setVisibility(lm, visibility);
        });
      } else {
        console.error("Can't find the layer");
      }
    }

    /**
     * A namespace to set z-index on selected layer
     * @param {Array} layerIds
     * @param {Number} zIndex
     */

  }, {
    key: 'setZIndex',
    value: function setZIndex(layerIds, zIndex) {
      var _this7 = this;

      var layerModels = this.layers.filter(function (l) {
        return layerIds.includes(l.id);
      });

      if (layerModels.length) {
        layerModels.forEach(function (lm) {
          _this7.plugin.setZIndex(lm, zIndex);
        });
      } else {
        console.error("Can't find the layer");
      }
    }

    /**
     * A namespace to set events on selected layer
     * @param  {Object} layerModel
     */

  }, {
    key: 'setEvents',
    value: function setEvents(layerModel) {
      var events = layerModel.events;


      if (events) {
        // Let's leave the managment of event to the plugin
        this.plugin.setEvents(layerModel);
      }
    }
  }, {
    key: 'requestLayer',
    value: function requestLayer(layerModel) {
      var _this8 = this;

      var provider = layerModel.provider;

      var method = this.plugin.getLayerByProvider(provider);

      if (!method) {
        this.promises[layerModel.id] = Promise.reject(new Error(provider + ' provider is not yet supported.'));
        return false;
      }

      // Cancel previous/existing request
      if (this.promises[layerModel.id] && this.promises[layerModel.id].isPending && this.promises[layerModel.id].isPending()) {
        this.promises[layerModel.id].cancel();
      }

      // every render method returns a promise that we store in the array
      // to control when all layers are fetched.
      this.promises[layerModel.id] = method.call(this, layerModel).then(function (layer) {
        layerModel.set('mapLayer', layer);

        _this8.plugin.add(layerModel);
        _this8.plugin.setZIndex(layerModel, layerModel.zIndex);
        _this8.plugin.setOpacity(layerModel, layerModel.opacity);
        _this8.plugin.setVisibility(layerModel, layerModel.visibility);

        _this8.setEvents(layerModel);
      });

      return this;
    }
  }, {
    key: 'requestLayerBounds',
    value: function requestLayerBounds(layerModel) {
      var provider = layerModel.provider;

      var method = this.plugin.getLayerBoundsByProvider(provider);
      var promiseHash = layerModel.id + '_bounds';

      if (!method) {
        return false;
      }

      // Cancel previous/existing request
      if (this.promises[promiseHash] && this.promises[promiseHash].isPending && this.promises[promiseHash].isPending()) {
        this.promises[promiseHash].cancel();
      }

      // every render method returns a promise that we store in the array
      // to control when all layers are fetched.
      this.promises[promiseHash] = method.call(this, layerModel).then(function (bounds) {
        layerModel.set('mapLayerBounds', bounds);
      });

      return this;
    }
  }]);

  return LayerManager;
}();

exports.default = LayerManager;