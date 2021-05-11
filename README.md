[![Build Status](https://travis-ci.org/Vizzuality/layer-manager.svg?branch=develop)](https://travis-ci.org/Vizzuality/layer-manager)

# Layer Manager

This library will help you to manage the addition and removal of layers. It also provides methods to set opacity, visibility and zIndex.

We currently only supports **Mapbox** spec. Leaflet or Google Maps Plugin are not supported yet.

## Docs

* [Installation](docs/INSTALLATION.md)
* [How to contribute](docs/HOW-TO-CONTRIBUTE.md)
* [Layer Specification](docs/LAYER-SPEC.md)
* [React Integration](docs/REACT-INTEGRATION.md)
* [Migration to V3](docs/MIGRATION-TO-V3.md)


## Quick start with MapboxGL

```js
import mapboxgl from 'mapbox-gl';
import MapboxGLPlugin from '@vizzuality/layer-manager-plugin-mapboxgl';
<<<<<<< HEAD
import CartoProvider from '@vizzuality/layer-manager-provider-carto';
=======
import cartoProvider from '@vizzuality/layer-manager-provider-carto';
>>>>>>> a560305... tslint
import LayerManager from '@vizzuality/layer-manager';

mapboxgl.accessToken = '<your access token here>';

<<<<<<< HEAD
const map = new mapboxgl.Map({
=======
var map = new mapboxgl.Map({
>>>>>>> a560305... tslint
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 9 // starting zoom
});

<<<<<<< HEAD
const plugin = new MapboxGLPlugin(map, pluginOptions); // required
const layerManager = new LayerManager(plugin);

// Optionally you can add additional providers
const provider = new CartoProvider();
LayerManager.registerProvider(provider); // optional

layerManager.add(layerSpec); // see docs/LAYER-SPEC.md
layerManager.remove(1);
=======
var plugin = new MapboxGLPlugin(map); // required
var providers = [cartoProvider]; // optional
var layerManager = new LayerManager(plugin, providers);

layerManager.add(layerSpec); // see docs/LAYER-SPEC.md

>>>>>>> a560305... tslint
```
