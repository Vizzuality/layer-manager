'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _layerManager = require('../layer-manager');

var _layerManager2 = _interopRequireDefault(_layerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Layer = function (_PureComponent) {
  _inherits(Layer, _PureComponent);

  function Layer() {
    _classCallCheck(this, Layer);

    return _possibleConstructorReturn(this, (Layer.__proto__ || Object.getPrototypeOf(Layer)).apply(this, arguments));
  }

  _createClass(Layer, [{
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
          layerSpec = _objectWithoutProperties(_props2, ['layerManager']);

      layerManager.add([layerSpec], {});
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return Layer;
}(_react.PureComponent);

Layer.propTypes = {
  id: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.number]).isRequired,
  layerManager: _propTypes2.default.instanceOf(_layerManager2.default)
};
Layer.defaultProps = { layerManager: null };
exports.default = Layer;