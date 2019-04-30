'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.post = exports.get = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var headers = {
  'Content-Type': 'application/json'
};

var get = exports.get = function get(url) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return _axios2.default.get(url, Object.assign({
    headers: headers
  }, options));
};

var post = exports.post = function post(url, body) {
  return _axios2.default.post(url, body, { headers: headers });
};

exports.default = { get: get, post: post };