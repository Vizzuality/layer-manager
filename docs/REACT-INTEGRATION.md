## :scissors: Usage with React

There are two React components that can be used to help with rendering layers via the layer manager. It can be imported and used as follows:

```js
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

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

<LayerManager map={this.map} plugin={PluginMapboxGl}>
  {activeLayers.map(l => (
    <Layer key={l.id} {...l} />
  ))}
</LayerManager>;
```

Example of ReatMapGL implementation with mapbox plugin:

```js
import React, { useState, useRef } from 'react';
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';
import ReactMapGL from 'react-map-gl';

const [loaded, setLoaded] = useState(false);
const mapRef = useRef();

export default () => (
  <ReactMapGL
    ref={mapRef}
    width="100%"
    height="100%"
    onLoad={() => setLoaded(true)}
    mapboxApiAccessToken={MAPBOX_TOKEN}
  >
    {loaded && mapRef.current && (
      <LayerManager map={mapRef.current.getMap()} plugin={PluginMapboxGl}>
        {activeLayers.map(l => (
          <Layer key={l.id} {...l} />
        ))}
      </LayerManager>
    )}
  </ReactMapGL>
);
```
