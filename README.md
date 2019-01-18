# Layer Manager 🤵

Fast management of layers across different map clients

## Install

Using npm:

`npm install layer-manager`

or using git:

`npm install vizzuality/layer-manager`

## How to use

```js
// Import LayersManager and the corresponding Plugin depending on the
// map provider that you are using
import LayerManager, { PluginLeaflet } from 'layer-manager';

const map = L.map('map_canvas').setView([40, -3], 5);

const layerManager = new LayerManager(map, PluginLeaflet, {});

// Adding all layers to map
layerManager.add(layerSpec, {
	opacity: 0.5,
	visibility: true,
	zIndex: 2,
	interactivity: [], // It can be any type. It will depend on the layer provider
	events: {
		click: e => {},
		mouseover: e => {}
	}, // Only events supported by your map provider

	// Some layers need to be decoded
	params: {
		url: '', // Tile url to be decoded. * Mandatory
		iso: 'BRA',
		thresh: 30
	}, // * Mandatory
	sqlParams: {
		where: {
			iso: 'BRA',
			thresh: 30
		}
	},
	decodeParams: {}, // * Mandatory
	decodeFunction: (data, w, h, z) => {
		// ...stuff
	}
});

// remove all layers
layerManager.remove();

// removing specific layers
layerManager.remove(['layerID']);

// Setting opacity to specific layer
layerManager.setOpacity('layerID', 0.5);
// Setting visibility to specific layer
layerManager.setVisibility('layerID', false);
// Setting z-index to specific layer
layerManager.setZIndex('layerID', 500);
```

`layerSpec` is the response of `http://api.resourcewatch.org/v1/layer?application=rw`.

Support for promises:

```js
spinner.start();

layerManager.add().then(layer => {
	spinner.stop();
	console.log('layer added');
});
```

### Leaflet dependencies

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.1/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"></script>
<script src="https://unpkg.com/esri-leaflet/dist/esri-leaflet.js"></script>
<script src="https://unpkg.com/leaflet-utfgrid/L.UTFGrid-min.js"></script>
```

### Adding a custom provider

TODO

### Available methods

| Method name   | Description                                                       | Default    |
| ------------- | ----------------------------------------------------------------- | ---------- |
| setOpacity    | To set opacity. A value beetween 0 and 1.                         | 1          |
| setVisibility | It shows or hidden a layer. Boolean.                              | true       |
| setZIndex     | It sets the layer position. Number                                | last index |
| setEvents     | Object map with { [event type]: [event handler] } key value pairs |            |

### Available plugins

| Plugin name   | Supported methods                                       | Supported providers                                                                                                                                                                   |
| ------------- | :------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PluginLeaflet | `setOpacity`, `setVisibility`, `setZIndex`, `setEvents` | `canvas`, `cartodb`, `carto`, `arcgis`, `featureservice`, `mapservice`, `tileservice`, `esrifeatureservice`, `esrimapservice`, `esritileservice`, `gee`, `loca`, `nexgddp`, `leaflet` |
| PluginCesium  | `setOpacity`, `setVisibility`, `setZIndex`, `setEvents` | `cartodb`, `carto`                                                                                                                                                                    |

## Components

### React

There is a single React component that can be used to help with rendering layers via the layer manager. It can be imported and used as follows:

```js
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginLeaflet } from 'layer-manager';

// map is a reference to whichever map API you are using
// For leaflet this would be
this.map = L.map('c-map', mapOptions);

<LayerManager map={this.map} plugin={PluginLeaflet}>
	{activeLayers.map(l => (
		<Layer key={l.id} {...l} />
	))}
</LayerManager>;
```
