'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LayerModel = function () {
  function LayerModel() {
    var layerSpec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LayerModel);

    this.opacity = 1;
    this.visibility = true;

    Object.assign(this, layerSpec, { changedAttributes: {} });
  }

  _createClass(LayerModel, [{
    key: 'get',
    value: function get(key) {
      return this[key];
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      this[key] = value;
      return this;
    }
  }, {
    key: 'update',
    value: function update(layerSpec) {
      var _this = this;

      var prevData = Object.assign({}, this);
      var nextData = Object.assign({}, layerSpec);

      // reseting changedAttributes for every update
      this.set('changedAttributes', {});

      Object.keys(nextData).forEach(function (k) {
        if (!(0, _isEqual2.default)(prevData[k], nextData[k])) {
          _this.changedAttributes[k] = nextData[k];
          _this.set(k, nextData[k]);
        }
      });
    }
  }]);

  return LayerModel;
}();

exports.default = LayerModel;