// This file exists as an entry point for bundling our umd builds.
// Both in rollup and in webpack, umd builds built from es6 modules are not
// compatible with mixed imports (which exist in index.js)
// This file does away with named imports in favor of a single export default.

import LayerManager from './layer-manager';
import Layer from './layer';

const Components = {};

Components.LayerManager = LayerManager;
Components.Layer = Layer;

export default Components;
