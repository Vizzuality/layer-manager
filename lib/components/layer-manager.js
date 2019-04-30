'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _layerManager = require('../layer-manager');

var _layerManager2 = _interopRequireDefault(_layerManager);

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var LayerManager = function (_PureComponent) {
  _inherits(LayerManager, _PureComponent);

  function LayerManager(props) {
    _classCallCheck(this, LayerManager);

    var _this = _possibleConstructorReturn(this, (LayerManager.__proto__ || Object.getPrototypeOf(LayerManager)).call(this, props));

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

    var map = props.map,
        plugin = props.plugin;

    _this.layerManager = new _layerManager2.default(map, plugin);
    return _this;
  }

  _createClass(LayerManager, [{
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


      if (children && _react.Children.count(children)) {
        return _react.Children.map(children, function (child, i) {
          return child && (0, _react.cloneElement)(child, {
            layerManager: _this2.layerManager,
            zIndex: child.props.zIndex || 1000 - i
          });
        });
      }

      if (layersSpec && layersSpec.length) {
        return _react2.default.createElement(
          _react.Fragment,
          null,
          layersSpec.map(function (spec, i) {
            return _react2.default.createElement(_layer2.default, _extends({
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

  return LayerManager;
}(_react.PureComponent);

LayerManager.propTypes = {
  map: _propTypes2.default.object.isRequired,
  plugin: _propTypes2.default.func.isRequired,
  layersSpec: _propTypes2.default.arrayOf(_propTypes2.default.object),
  children: _propTypes2.default.oneOfType([_propTypes2.default.arrayOf(_propTypes2.default.node), _propTypes2.default.node]),
  onLayerLoading: _propTypes2.default.func,
  onReady: _propTypes2.default.func
};
LayerManager.defaultProps = {
  children: [],
  layersSpec: [],
  onLayerLoading: null,
  onReady: null
};
exports.default = LayerManager;