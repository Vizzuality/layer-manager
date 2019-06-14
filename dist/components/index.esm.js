import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import React, { PureComponent, Children, cloneElement, Fragment } from 'react';
import PropTypes from 'prop-types';

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var LayerModel = function () {
  function LayerModel() {
    var layerSpec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    classCallCheck(this, LayerModel);
    this.opacity = 1;
    this.visibility = true;

    Object.assign(this, layerSpec, { changedAttributes: {} });
  }

  createClass(LayerModel, [{
    key: 'get',
    value: function get$$1(key) {
      return this[key];
    }
  }, {
    key: 'set',
    value: function set$$1(key, value) {
      this[key] = value;
      return this;
    }
  }, {
    key: 'update',
    value: function update(layerSpec) {
      var _this = this;

      var prevData = _extends({}, this);
      var nextData = _extends({}, layerSpec);

      // reseting changedAttributes for every update
      this.set('changedAttributes', {});

      Object.keys(nextData).forEach(function (k) {
        if (!isEqual(prevData[k], nextData[k])) {
          _this.changedAttributes[k] = nextData[k];
          _this.set(k, nextData[k]);
        }
      });
    }
  }]);
  return LayerModel;
}();

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

    classCallCheck(this, LayerManager);

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


  createClass(LayerManager, [{
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
        var nextModel = _extends({}, layer, layerOptions);

        if (existingLayer) {
          existingLayer.update(nextModel);
        } else {
          _this3.layers.push(new LayerModel(nextModel));
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

      if (!isEmpty(layerConfig)) this.plugin.setLayerConfig(layerModel);
      if (!isEmpty(params)) this.plugin.setParams(layerModel);
      if (!isEmpty(sqlParams)) this.plugin.setParams(layerModel);
      if (!isEmpty(decodeParams)) this.plugin.setDecodeParams(layerModel);
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

var Layer = function (_PureComponent) {
  inherits(Layer, _PureComponent);

  function Layer() {
    classCallCheck(this, Layer);
    return possibleConstructorReturn(this, (Layer.__proto__ || Object.getPrototypeOf(Layer)).apply(this, arguments));
  }

  createClass(Layer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.addSpecToLayerManager();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.addSpecToLayerManager();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var _props = this.props,
          layerManager = _props.layerManager,
          id = _props.id;

      layerManager.remove(id);
    }
  }, {
    key: 'addSpecToLayerManager',
    value: function addSpecToLayerManager() {
      var _props2 = this.props,
          layerManager = _props2.layerManager,
          layerSpec = objectWithoutProperties(_props2, ['layerManager']);

      layerManager.add([layerSpec], {});
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);
  return Layer;
}(PureComponent);

Layer.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  layerManager: PropTypes.instanceOf(LayerManager)
};
Layer.defaultProps = { layerManager: null };

var LayerManager$1 = function (_PureComponent) {
  inherits(LayerManager$$1, _PureComponent);

  function LayerManager$$1(props) {
    classCallCheck(this, LayerManager$$1);

    var _this = possibleConstructorReturn(this, (LayerManager$$1.__proto__ || Object.getPrototypeOf(LayerManager$$1)).call(this, props));

    _this.onRenderLayers = function () {
      var _this$props = _this.props,
          onLayerLoading = _this$props.onLayerLoading,
          onReady = _this$props.onReady;

      if (_this.layerManager.layers && _this.layerManager.layers.length) {
        if (onLayerLoading) onLayerLoading(true);
        _this.layerManager.renderLayers().then(function (layers) {
          if (onReady) onReady(layers);
          if (onLayerLoading) onLayerLoading(false);
        });
      }
    };

    _this.fitMapToLayer = function (layerId) {
      return _this.layerManager.fitMapToLayer(layerId);
    };

    var map = props.map,
        plugin = props.plugin;

    _this.layerManager = new LayerManager(map, plugin);
    return _this;
  }

  createClass(LayerManager$$1, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.onRenderLayers();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.onRenderLayers();
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          children = _props.children,
          layersSpec = _props.layersSpec;


      if (children && Children.count(children)) {
        return Children.map(children, function (child, i) {
          return child && cloneElement(child, {
            layerManager: _this2.layerManager,
            zIndex: child.props.zIndex || 1000 - i
          });
        });
      }

      if (layersSpec && layersSpec.length) {
        return React.createElement(
          Fragment,
          null,
          layersSpec.map(function (spec, i) {
            return React.createElement(Layer, _extends({
              key: spec.id
            }, spec, {
              zIndex: spec.zIndex || 1000 - i,
              layerManager: _this2.layerManager
            }));
          })
        );
      }

      return null;
    }
  }]);
  return LayerManager$$1;
}(PureComponent);

LayerManager$1.propTypes = {
  map: PropTypes.object.isRequired,
  plugin: PropTypes.func.isRequired,
  layersSpec: PropTypes.arrayOf(PropTypes.object),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  onLayerLoading: PropTypes.func,
  onReady: PropTypes.func
};
LayerManager$1.defaultProps = {
  children: [],
  layersSpec: [],
  onLayerLoading: null,
  onReady: null
};

export { LayerManager$1 as LayerManager, Layer };
