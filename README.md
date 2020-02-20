[![Build Status](https://travis-ci.org/Vizzuality/layer-manager.svg?branch=develop)](https://travis-ci.org/Vizzuality/layer-manager)

# Layer Manager

This library will help you to manage the addition and removal of layers. It also provides methods to set opacity, visibility and zIndex.

We currently only supports Mapbox spec. Leaflet or Google Maps Plugin is in our minds.

## :bomb: Install

Using npm:

`npm install layer-manager`

Using yarn:

`yarn add layer-manager`


## :heavy_exclamation_mark: Requirements

`layer-manager` requires `react@16.3.2` or higher to work.

You should also install this packages versions to have everything working `deck.gl@7.3.6`, `luma.gl@7.3.2` and `viewport-mercator-project@6.1.1`, `axios`




## :clipboard: Docs

### LayerManager

#### `map - (required)`

An instance of the map.

#### `plugin - (required)`

A plugin to handle all the layer functionalities depending on the map tech. Layer Manager provides you with the Mapbox one, if you want to use Leaflet, GoogleMaps or any other map tech you should provide it with the correct specification.

How could you create your own plugin? => Cooming soon

#### `providers - (required)`
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

#### `opacity - (optional) - (number)`

A number between 0 and 1. Default: 1

#### `visibility - (optional) - (boolean)`

A boolean to set the visibility of the layer. Changing visibility won't remove the layer from the map, it will only hide it. Default: true

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

#### `decodeParams - (optional) - (object)`

An object that we will use as properties to decode the raster tile images of a layer. The must be numbers, no strings allowed.

`decodeFunction` must be present.

These `decodeParams` will be sent to the `decodeFunction`.

Example:

```json
{
  "decodeParams": {
    "startYear": 2001,
    "endYear": 2018
  }
}
```

#### `decodeFunction - (optional) - (string)`

A shader that defines how to decode each of the images tiles that comes to a raster layer.

`decodeParams` must be present.

## :scissors: Usage

There are two React components that can be used to help with rendering layers via the layer manager. It can be imported and used as follows:

```js
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapbox } from 'layer-manager';

// map is a reference to whichever map API you are using
// For mapbox, we trully recommend `react-map-gl`
this.map = new Map();

const activeLayers = [
  // RASTER LAYER
  {
    id: 'gain',
    type: 'raster',
    source: {
      type: 'raster',
      tiles: ['http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'],
      minzoom: 3,
      maxzoom: 12
    },
    render: {
      layers: [
        {
          minzoom: 3, // https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#minzoom
          maxzzom: 12, // https://docs.mapbox.com/mapbox-gl-js/style-spec/layers/#maxzoom
          paint: {
            'raster-saturation': -1
          }
        }
      ]
    }
  },

  // DECODED RASTER LAYER
  {
    id: 'loss',
    type: 'raster',
    source: {
      type: 'raster',
      tiles: [
        `https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png`
      ],
      minzoom: 3,
      maxzoom: 12
    },
    decodeParams: {
      startYear: 2001,
      endYear: 2018
    },
    decodeFunction: `
      // values for creating power scale, domain (input), and range (output)
      float domainMin = 0.;
      float domainMax = 255.;
      float rangeMin = 0.;
      float rangeMax = 255.;

      float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
      float intensity = color.r * 255.;

      // get the min, max, and current values on the power scale
      float minPow = pow(domainMin, exponent - domainMin);
      float maxPow = pow(domainMax, exponent);
      float currentPow = pow(intensity, exponent);

      // get intensity value mapped to range
      float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
      // a value between 0 and 255
      alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

      float year = 2000.0 + (color.b * 255.);
      // map to years
      if (year >= startYear && year <= endYear && year >= 2001.) {
        color.r = 220. / 255.;
        color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
        color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
      } else {
        alpha = 0.;
      }
    `
  },

  // GEOJSON DATA LAYER
  {
    id: 'multipolygon',
    type: 'geojson',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [
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
    render: {
      layers: [
        {
          type: 'fill',
          paint: {
            'fill-color': '#FFBB00',
            'fill-opacity': 1
          }
        },
        {
          type: 'line',
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.1
          }
        }
      ]
    }
  },

  // VECTOR LAYER PROVIDER CARTO
  {
    params: {
      color: '#CCC'
    },
    id: 'protected-areas',
    type: 'vector',
    source: {
      type: 'vector',
      provider: {
        type: 'carto',
        options: {
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss:
                  '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
                cartocss_version: '2.3.0',
                sql: 'SELECT * FROM wdpa_protected_areas'
              },
              type: 'cartodb'
            }
          ]
        }
      }
    },
    render: {
      layers: [
        {
          type: 'fill',
          'source-layer': 'layer0',
          paint: {
            'fill-color': '{color}',
            'fill-opacity': 1
          }
        },
        {
          type: 'line',
          'source-layer': 'layer0',
          paint: {
            'line-color': '#000000',
            'line-opacity': 0.1
          }
        }
      ]
    }
  },
  {
    params: {
      iso3: 'swe',
      year: 2020
    },
    sqlParams: {
      where: {
        iso3: 'SWE'
      },
      where2: {
        species: 'Picea glauca',
        scenario: 'rcp45'
      }
    },
    onAfterAdd: layerModel => {
      // do stuff with the layerModel
    },
    id: 'species',
    type: 'vector',
    source: {
      type: 'vector',
      provider: {
        type: 'carto',
        options: {
          account: 'simbiotica',
          // api_key: 'añsdlkjfñaklsjdfklñajsdfñlkadjsf',
          layers: [
            {
              options: {
                sql: "WITH a AS (SELECT cartodb_id, the_geom_webmercator, uuid, iso3 FROM all_geometry {{where}}) SELECT a.the_geom_webmercator, a.cartodb_id, b.uuid, b.timeinterval as year, b.species, b.scenario, b.probabilityemca FROM {iso3}_zonal_spp_uuid as b INNER JOIN a ON b.uuid = a.uuid {{where2}}"
              },
              type: 'cartodb'
            }
          ]
        }
      }
    },
    render: {
      layers: [
        {
          filter: ['==', 'year', "{year}"],
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'probabilityemca'],
              0,
              'transparent',
              0.5,
              '#FFFFFF',
              1,
              '#7044FF'
            ],
            'fill-opacity': 1
          },
          'source-layer': 'layer0',
          type: 'fill'
        }
      ]
    }
  }
];

<LayerManager map={this.map} plugin={PluginMapbox}>
  {activeLayers.map(l => (
    <Layer key={l.id} {...l} />
  ))}
</LayerManager>;
```
