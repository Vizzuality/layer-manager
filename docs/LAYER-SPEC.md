## :clipboard: Docs

### LayerManager

#### `map - (required)`

An instance of the map.

#### `plugin - (required)`

A plugin to handle all the layer functionalities depending on the map tech. Layer Manager provides you with the Mapbox one, if you want to use Leaflet, GoogleMaps or any other map tech you should provide it with the correct specification.

How could you create your own plugin? => Cooming soon

#### `providers - (optional)`
An object with the provider type as a key. Each key should be a function.

Each function will receive the following props:
- `layerModel - (object)`
  - Current layer model. It contains `source` and `render` already parsed.
- `layer - (object)`
  - Current layer spec ready to be consumed.
- `resolve - (function)`
  - resolve function from the Promise. You must resolve it always with the `layer` transformed
- `reject - (function)`
  - reject function from the Promise.



If you need to fetch something inside this function you will need to use `fetch` function exported by layer-manager. It's a little wrapper around axios and adds a `CancelToken` from axios that will cancel requests to prevent duplicate layers and bugs.

You need to send the following params
- `type - (required) - (string)`
  - get or post
- `url - (required) - (string)`
  - url where you want to get the data
- `options - (required) - (object)`
  - axios options
- `layerModel - (required) - (object)`
  - It will be used for saving the request and apply cancelation


EXAMPLE:
```js
  {
    id: 'mongabay-stories',
    name: 'Mongabay stories',
    type: 'geojson',
    source: {
      type: 'geojson',
      provider: {
        type: 'mongabay-stories',
        url: 'https://wri-01.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20mongabay&format=geojson',
        options: {}
      }
    },
    render: {
      metadata: {
        position: 'top'
      },
      layers: [
        {
          type: 'circle',
          paint: {
            'circle-color': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              3,
              '#e2714b',
              6,
              '#eee695'
            ],
            'circle-stroke-width': 1
          },

          // It will put the layer on the top
          metadata: {
            position: 'top'
          }
        }
      ]
    }
  }
```

```js
// PROVIDERS functions
import { fetch } from 'layer-manager';

{
  'mongabay-stories': (layerModel, layer, resolve, reject) => {
    const { source } = layerModel;
    const { provider } = source;

    fetch('get', provider.url, provider.options, layerModel)
      .then(response => {
        return resolve({
          ...layer,
          source: {
            ...omit(layer.source, 'provider'),
            data: {
              type: 'FeatureCollection',
              features: response.rows.map(r => ({
                type: 'Feature',
                properties: r,
                geometry: {
                  type: 'Point',
                  coordinates: [r.lon, r.lat]
                }
              }))
            }
          }
        });
      })
      .catch(e => {
        reject(e);
      });
  }
}
```



### Layer

#### `id - (required) - (string|number)`

A unique value.

#### `type - (required) - (string)`

One of these values. ['raster', 'vector', 'geojson'].

#### `source - (required) - (object)`

An object defining how you are going to get the layer data. Only raster, vector and geojson are supported. Check this link https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/

Example:

```json
{
  "type": "raster",
  "tiles": ["http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png"]
}
```

If you define a provider (remember to set the providers at LayerManager initialization) it will call the provider method and you will need to resolve the Promise.

if you need to make a request inside your custom provider use

```js
import { fetch } from 'layer-manager';

fetch(type, url, options, layerModel)
```

After you fetch you need to resolve or reject the promise

#### `render - (optional) - (object)`

An object defining how you are going to display the layer data. To define layer styles you must provide a `layers` array attribute containing all the styles. Those styles follow the Mapbox style spec https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/

Example:

```json
{
  "layers": [
    {
      "type": "fill",
      "source-layer": "layer0",
      "paint": {
        "fill-color": "#000000",
        "fill-opacity": 1
      }
    },
    {
      "type": "line",
      "source-layer": "layer0",
      "paint": {
        "line-color": "#000000",
        "line-opacity": 0.1
      }
    }
  ]
}
```

#### `images - (optional) - (array)`
An array defining images that you want to add to the mapbox styles. This array must contain objects with `id` and `src`. After that you can add layers type symbol with your custom icons by using the id you have already defined. You can also add `options`. It will be used for adding custom options to addImage function from mapbox https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addimage

Example:

```json
{
  "images": [
    {
      "id": "marker1",
      "src": "/static/images/marker1.svg",
      "options": {}
    }
  ]
}
```


#### `opacity - (optional) - (number)`

A number between 0 and 1. Default: 1

#### `visibility - (optional) - (boolean)`

A boolean to set the visibility of the layer. Changing visibility won't remove the layer from the map, it will only hide it. Default: true

<!-- TODO: explain filters and layout properties -->
#### `params - (optional) - (object)`

An object that we will use to substitute all the concurrences of each key with its respective value inside `render` and `source`.

Example:

Given this layer object.
Pay atention to the colors inside `render.layers` and the `params`object.

```json
{
  "id": "test",
  "type": "geojson",
  "params": {
    "color": "#CCC"
  },
  "source": {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.3046875, 48.69096039092549],
                [5.625, 20.632784250388028],
                [45.3515625, 27.059125784374068],
                [48.515625, 45.82879925192134],
                [12.3046875, 48.69096039092549]
              ]
            ]
          }
        }
      ]
    }
  },
  "render": {
    "layers": [
      {
        "type": "fill",
        "paint": {
          "fill-color": "{color}",
          "fill-opacity": 1
        }
      },
      {
        "type": "line",
        "paint": {
          "line-color": "{{color}}",
          "line-opacity": 0.1
        }
      }
    ]
  }
}
```

`{color}` and `{{color}}` will be substituted by '#CCC' before adding thew layer.

```json
{
  "id": "test",
  "type": "geojson",
  "params": {
    "color": "#CCC"
  },
  "source": {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [12.3046875, 48.69096039092549],
                [5.625, 20.632784250388028],
                [45.3515625, 27.059125784374068],
                [48.515625, 45.82879925192134],
                [12.3046875, 48.69096039092549]
              ]
            ]
          }
        }
      ]
    }
  },
  "render": {
    "layers": [
      {
        "type": "fill",
        "paint": {
          "fill-color": "#CCC",
          "fill-opacity": 1
        }
      },
      {
        "type": "line",
        "paint": {
          "line-color": "#CCC",
          "line-opacity": 0.1
        }
      }
    ]
  }
}
```

#### `sqlParams - (optional) - (object)`

An object that we will use to substitute all the concurrences of each key with its respective value, but in **sql format**.

The name of the keys is very important. Depending on the name the replacement will be different. You can use several `where` or `and` by adding a number after. Check the example.

-   `where`: `WHERE` statment wil be used for the substitution.
-   `and`: `AND` statment wil be used for the substitution.
-   other: it will be substituted directly

Example:

Given this layer object

```json
{
  "id": "species",
  "type": "vector",
  "params": {
    "iso3": "swe",
    "year": 2020
  },
  "sqlParams": {
    "where": {
      "iso3": "SWE"
    },
    "where2": {
      "species": "Picea glauca",
      "scenario": "rcp45"
    }
  },
  "source": {
    "type": "vector",
    "provider": {
      "type": "carto",
      "options": {
        "account": "simbiotica",
        "layers": [
          {
            "options": {
              "sql": "WITH a AS (SELECT cartodb_id, the_geom_webmercator, uuid, iso3 FROM all_geometry {{where}}) SELECT a.the_geom_webmercator, a.cartodb_id, b.uuid, b.timeinterval as year, b.species, b.scenario, b.probabilityemca FROM {iso3}_zonal_spp_uuid as b INNER JOIN a ON b.uuid = a.uuid {{where2}}"
            },
            "type": "cartodb"
          }
        ]
      }
    }
  },
  "render": {
    "layers": [
      {
        "filter": ["==", "year", "{year}"],
        "paint": {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "probabilityemca"],
            0,
            "transparent",
            0.5,
            "#FFFFFF",
            1,
            "#7044FF"
          ],
          "fill-opacity": 1
        },
        "source-layer": "layer0",
        "type": "fill"
      }
    ]
  }
}
```

You will have this result

```json
{
  "id": "species",
  "type": "vector",
  "source": {
    "type": "vector",
    "provider": {
      "type": "carto",
      "options": {
        "account": "simbiotica",
        "layers": [
          {
            "options": {
              "sql": "WITH a AS (SELECT cartodb_id, the_geom_webmercator, uuid, iso3 FROM all_geometry WHERE iso3 = 'SWE') SELECT a.the_geom_webmercator, a.cartodb_id, b.uuid, b.timeinterval as year, b.species, b.scenario, b.probabilityemca FROM swe_zonal_spp_uuid as b INNER JOIN a ON b.uuid = a.uuid WHERE species = 'Picea glauca' AND scenario = 'rcp45'"
            },
            "type": "cartodb"
          }
        ]
      }
    }
  },
  "render": {
    "layers": [
      {
        "filter": ["==", "year", 2020],
        "paint": {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["get", "probabilityemca"],
            0,
            "transparent",
            0.5,
            "#FFFFFF",
            1,
            "#7044FF"
          ],
          "fill-opacity": 1
        },
        "source-layer": "layer0",
        "type": "fill"
      }
    ]
  }
}
```

#### `onAfterAdd` - (optional) - (function)
A function that will be triggered after you add a layer. It doesn't mean that the layer tiles are loaded, it means that the layer is ready for consumption for things like adding interactivity, reading source, etc...

#### `onAfterRemove` - (optional) - (function)
A function that will be triggered after you remove a layer.
