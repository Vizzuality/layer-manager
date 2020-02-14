// This file exists as an entry point for bundling our umd builds.
// Both in rollup and in webpack, umd builds built from es6 modules are not
// compatible with mixed imports (which exist in index.js)
// This file does away with named imports in favor of a single export default.

// import PluginLeaflet from './plugins/plugin-leaflet';
import PluginMapboxGl from './plugins/plugin-mapbox-gl';

import { replace, substitution, concatenation } from './utils/query';
import LayerManager from './layer-manager';

// LayerManager.PluginLeaflet = PluginLeaflet;
LayerManager.PluginMapboxGl = PluginMapboxGl;
LayerManager.replace = replace;
LayerManager.substitution = substitution;
LayerManager.concatenation = concatenation;

export default LayerManager;
