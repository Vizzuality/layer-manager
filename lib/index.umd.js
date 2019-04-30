'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pluginLeaflet = require('./plugins/plugin-leaflet');

var _pluginLeaflet2 = _interopRequireDefault(_pluginLeaflet);

var _pluginCesium = require('./plugins/plugin-cesium');

var _pluginCesium2 = _interopRequireDefault(_pluginCesium);

var _query = require('./utils/query');

var _layerManager = require('./layer-manager');

var _layerManager2 = _interopRequireDefault(_layerManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This file exists as an entry point for bundling our umd builds.
// Both in rollup and in webpack, umd builds built from es6 modules are not
// compatible with mixed imports (which exist in index.js)
// This file does away with named imports in favor of a single export default.

_layerManager2.default.PluginLeaflet = _pluginLeaflet2.default;
_layerManager2.default.PluginCesium = _pluginCesium2.default;
_layerManager2.default.replace = _query.replace;
_layerManager2.default.substitution = _query.substitution;
_layerManager2.default.concatenation = _query.concatenation;

exports.default = _layerManager2.default;