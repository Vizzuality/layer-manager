# Layer Manager 🤵

Fast management of layers across different map clients

## Install

Using npm:

`npm install layer-manager`

or using git:

`npm install vizzuality/layer-manager`


## ❗ Requirements
`layer-manager` requires `react@16.3.2` or higher to work.

## How to use

```js
// Import LayersManager and the corresponding Plugin depending on the
// map provider that you are using
import LayerManager, { PluginLeaflet } from 'layer-manager';

const map = L.map('map_canvas').setView([40, -3], 5);

const layerManager = new LayerManager(map, PluginLeaflet, {});

// Adding all layers to map
layerManager.add([
  {
    provider: 'carto',
    opacity: 1,
    visibility: true,
    zIndex: 2,
    interactivity: ['country', 'iso'],
    events: {
      click: (...args) => { console.log(args) }
    },
    sqlParams: {
      where: {
        year: 2010,
        commodity: 'rice'
      },
    },
    layerConfig: {
      type: "leaflet",
      body: {
        use_cors: false,
        url: "https://wri-rw.carto.com/api/v2/sql?q=with s as (SELECT iso, region, value, commodity FROM combined01_prepared {{where}} and impactparameter='Food Demand' and scenario='SSP2-MIRO' and iso is not null and commodity <> 'All Cereals' and commodity <> 'All Pulses' ), r as (SELECT iso, region, sum(value) as value FROM s group by iso, region), d as (SELECT centroid as geometry, iso, value, region FROM impact_regions_159 t inner join r on new_region=iso) select json_build_object('type','FeatureCollection','features',json_agg(json_build_object('geometry',cast(geometry as json),'properties', json_build_object('value',value,'country',region,'iso',iso, 'unit', 'thousand metric tons'),'type','Feature'))) as data from d"
      },
      sql_config: [
        {
          key: "where",
          key_params: [
            {
              required: true,
              key: "year"
            },
            {
              required: false,
              key: "commodity"
            }
          ]
        }
      ],
      params_config: [],	
    },
  }
]);

// remove all layers
layerManager.remove();

// removing specific layers
layerManager.remove(['layerID']);
```

## Layer Model
| Attribute      | Description                                                                                                                                                                                      | Type            | Default |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------|---------|
| opacity        | A number between 0 and 1.                                                                                                                                                                        | Number          | 1       |
| visibility     | A boolean                                                                                                                                                                                        | Boolean         | true    |
| zIndex         | A number to set the position of the layer                                                                                                                                                        | Number          |         |
| provider       | A string that defines the type of layer that you want to display. It depends on the Plugin that you are using. Check the supported providers for each Plugin                                     | String          |         |
| layerConfig    | An object that defines how to get the layer                                                                                                                                                      | Object          |         |
| params         | An object that defines how to parse the layer.                                                                                                                            | Object          |         |
| sqlParams      | An object that defines how to parse the layer                                                                                                                                                    | Object          |         |
| decodeParams   | An object that defines how to decode the layer                                                                                                                                                   | Object          |         |
| decodeFunction | A function that defines how to decode the layer                                                                                                                                                  | Object          |         |
| interactivity  | An array or a boolean. It depends on the provider. You should define an array if it is a carto layer because you need that array in the call to get the carto layer.                             | Array / Boolean |         |
| events         | An object that defines how you want to interact with your layer. Of course, only events supported by your map provider. Object map with key value pairs. ```{ [event type]: [event handler] }``` | Object          |         |

## Plugins
The plugin is the way of abstract the layer managment from the implementation of the layer in the different type of maps that we will be using.

There are some predefined plugins (LeafletPlugin, CesiumPlugin, MapboxPlugin) and there will be more! 

When you create an instance of the plugin you will receive the `map instance` so you can acces to it in all the methods below. You should also define all the providers and the functions that you are going to use to get the layer in an attribute called `methods`

```js
import cartoLayer from './carto-layer-leaflet';
import esriLayer from './esri-layer-leaflet';
import geeLayer from './gee-layer-leaflet';
import locaLayer from './loca-layer-leaflet';
import nexgddpLayer from './nexgddp-layer-leaflet';
import leafletLayer from './leaflet-layer-leaflet';

class PluginLeaflet {
  constructor(map) {
    this.map = map;
  }

  methods = {
    // CARTO
    cartodb: cartoLayer,
    carto: cartoLayer,
    // ESRI
    arcgis: esriLayer,
    featureservice: esriLayer,
    mapservice: esriLayer,
    tileservice: esriLayer,
    esrifeatureservice: esriLayer,
    esrimapservice: esriLayer,
    esritileservice: esriLayer,
    // GEE && LOCA && NEXGDDP
    gee: geeLayer,
    loca: locaLayer,
    nexgddp: nexgddpLayer,
    // LEAFLET
    leaflet: leafletLayer,
    wms: leafletLayer
  };
}

```

It MUST have this methods `add, remove, getLayerByProvider, setZIndex, setOpacity, setVisibility, setEvents, setParams, setLayerConfig, setDecodeParams`;

### Methods

#### add
```js
add(layerModel) {
  //add layer stuff related to the current plugin
}
```

#### remove
```js
remove(layerModel) {
  //remove layer stuff related to the current plugin
}
```

#### getLayerByProvider
```js
getLayerByProvider(provider) {
  return this.methods[provider];
}
```

#### setZIndex
```js
setZIndex(layerModel, zIndex) {
  //setZIndex layer stuff related to the current plugin
}
```

#### setOpacity
```js
setOpacity(layerModel, opacity) {
  //setOpacity layer stuff related to the current plugin
}
```

#### setVisibility
```js
setVisibility(layerModel, visibility) {
  //setVisibility layer stuff related to the current plugin
}
```

#### setParams
```js
setParams(layerModel) {
  //setParams layer stuff related to the current plugin
}
```

#### setSQLParams
```js
setSQLParams(layerModel) {
  //setSQLParams layer stuff related to the current plugin
}
```

#### setDecodeParams
```js
setDecodeParams(layerModel) {
  //setDecodeParams layer stuff related to the current plugin
}
```

#### setLayerConfig
```js
setLayerConfig(layerModel) {
  //setLayerConfig layer stuff related to the current plugin
}
```


### Leaflet
#### dependencies
```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.1/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"></script>
<script src="https://unpkg.com/esri-leaflet/dist/esri-leaflet.js"></script>
<script src="https://unpkg.com/leaflet-utfgrid/L.UTFGrid-min.js"></script>
```

#### supported providers
- `canvas`
- `cartodb`
- `carto`
- `arcgis`
- `featureservice`
- `mapservice`
- `tileservice`
- `esrifeatureservice`
- `esrimapservice`
- `esritileservice`
- `gee`
- `loca`
- `nexgddp`
- `leaflet`



## React
There are two React components that can be used to help with rendering layers via the layer manager. It can be imported and used as follows:


```js
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginLeaflet } from 'layer-manager';

// map is a reference to whichever map API you are using
// For leaflet this would be
this.map = L.map('c-map', mapOptions);

const activeLayers = [
  {
    provider: 'carto',
    opacity: 1,
    visibility: true,
    zIndex: 2,
    interactivity: ['country', 'iso'],
    events: {
      click: (...args) => { console.log(args) }
    },
    sqlParams: {
      where: {
        year: 2010,
        commodity: 'rice'
      },
    },
    layerConfig: {
      type: "leaflet",
      body: {
        use_cors: false,
        url: "https://wri-rw.carto.com/api/v2/sql?q=with s as (SELECT iso, region, value, commodity FROM combined01_prepared {{where}} and impactparameter='Food Demand' and scenario='SSP2-MIRO' and iso is not null and commodity <> 'All Cereals' and commodity <> 'All Pulses' ), r as (SELECT iso, region, sum(value) as value FROM s group by iso, region), d as (SELECT centroid as geometry, iso, value, region FROM impact_regions_159 t inner join r on new_region=iso) select json_build_object('type','FeatureCollection','features',json_agg(json_build_object('geometry',cast(geometry as json),'properties', json_build_object('value',value,'country',region,'iso',iso, 'unit', 'thousand metric tons'),'type','Feature'))) as data from d"
      },
      sql_config: [
        {
          key: "where",
          key_params: [
            {
              required: true,
              key: "year"
            },
            {
              required: false,
              key: "commodity"
            }
          ]
        }
      ],
      params_config: [],	
    },
  }
];

<LayerManager map={this.map} plugin={PluginLeaflet}>
  {activeLayers.map(l => (
    <Layer key={l.id} {...l} />
  ))}
</LayerManager>;
```

