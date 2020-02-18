[![Build Status](https://travis-ci.org/Vizzuality/layer-manager.svg?branch=develop)](https://travis-ci.org/Vizzuality/layer-manager)

# Layer Manager

A library to manage the addition, and removal of layers in Mapbox. Furthermore it provides methods to set opacity, visibility and zIndex.

## :bomb: Install

Using npm:

`npm install layer-manager`

or using git:

`npm install vizzuality/layer-manager`

## :heavy_exclamation_mark: Requirements

`layer-manager` requires `react@16.3.2` or higher to work.

You should also install this packages versions to have everything working `deck.gl@7.3.6`, `luma.gl@7.3.2` and `viewport-mercator-project@6.1.1`

## :clipboard: Docs

### LayerManager

#### `map - (required)`

An instance of the map.

#### `plugin - (required)`

A plugin to handle all the layer functionalities depending on the map tech. Layer Manager provides you the Mapbox one, if you want to use Leaflet, GoogleMaps or any other map tech you should provide it with the correct specification.

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

#### `params - (optional) - (object)`

An object that we will use to substitute all the concurrences of each key with its respective value inside `render` and `source`.

Example:

Given this layer object

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

You will have this result

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

An object that we will use to substitute all the concurrences of each key with its respective value, but in sql format.

The name of the keys is very important at this point. Depending on the name the replacement will be different. You can use several where or and by adding a number behind. Check the example.

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

A shader to decode each of the images tiles that you want to put on the map.

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
