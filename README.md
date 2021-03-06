[![Run tests](https://github.com/Vizzuality/layer-manager/actions/workflows/test.yml/badge.svg)](https://github.com/Vizzuality/layer-manager/actions/workflows/test.yml)

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
import CartoProvider from '@vizzuality/layer-manager-provider-carto';
import LayerManager from '@vizzuality/layer-manager';

mapboxgl.accessToken = '<your access token here>';

const map = new mapboxgl.Map({
	container: 'map', // container ID
	style: 'mapbox://styles/mapbox/streets-v11', // style URL
	center: [-74.5, 40], // starting position [lng, lat]
	zoom: 9 // starting zoom
});

const plugin = new MapboxGLPlugin(map, pluginOptions); // required
const layerManager = new LayerManager(plugin);

// Optionally you can add additional providers
const provider = new CartoProvider();
LayerManager.registerProvider(provider); // optional

layerManager.add(layerSpec); // see docs/LAYER-SPEC.md
layerManager.remove(1);
```
