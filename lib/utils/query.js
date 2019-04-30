'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replace = exports.concatenation = exports.substitution = undefined;

var _compact = require('lodash/compact');

var _compact2 = _interopRequireDefault(_compact);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Params should have this format => { key:'xxx', key2:'xxx' }
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
var substitution = exports.substitution = function substitution(originalStr) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var str = originalStr;
  Object.keys(params).forEach(function (key) {
    str = str.replace(new RegExp('{{' + key + '}}', 'g'), params[key]).replace(new RegExp('{' + key + '}', 'g'), params[key]);
  });
  return str;
};

/**
 * Params should have this format => { where1: { { key:'xxx', key2:'xxx' } }},
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
var concatenation = exports.concatenation = function concatenation(originalStr) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var str = originalStr;
  var sql = void 0;

  Object.keys(params).forEach(function (key) {
    sql = '' + (0, _compact2.default)(Object.keys(params[key]).map(function (k) {
      var value = params[key][k];

      if (Array.isArray(value) && !!value.length) {
        var mappedValue = value.map(function (v) {
          return typeof v !== 'number' ? '\'' + v + '\'' : v;
        });
        return k + ' IN (' + mappedValue.join(', ') + ')';
      }

      if (!Array.isArray(value) && value) {
        return typeof value !== 'number' ? k + ' = \'' + value + '\'' : k + ' = ' + value;
      }

      return null;
    })).join(' AND ');

    if (sql && key.startsWith('where')) sql = 'WHERE ' + sql;else if (sql && key.startsWith('and')) sql = 'AND ' + sql;else sql = '';

    str = str.replace(new RegExp('{{' + key + '}}', 'g'), sql);
    str = str.replace(new RegExp('{' + key + '}', 'g'), sql);
  });

  return str;
};

/**
 * Replace function
 * @param {String} string
 * @param {Object} params
 * @param {Object} sqlParams
 */
var replace = exports.replace = function replace(originalStr) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var sqlParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var str = originalStr;

  if (typeof str === 'string') {
    str = substitution(str, params);
    str = concatenation(str, sqlParams);
  }

  return str;
};

exports.default = { substitution: substitution, concatenation: concatenation, replace: replace };