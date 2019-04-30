'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _layerManager = require('./layer-manager');

var _layerManager2 = _interopRequireDefault(_layerManager);

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// This file exists as an entry point for bundling our umd builds.
// Both in rollup and in webpack, umd builds built from es6 modules are not
// compatible with mixed imports (which exist in index.js)
// This file does away with named imports in favor of a single export default.

var Components = {};

Components.LayerManager = _layerManager2.default;
Components.Layer = _layer2.default;

exports.default = Components;