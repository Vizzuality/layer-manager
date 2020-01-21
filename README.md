[![Build Status](https://travis-ci.org/Vizzuality/layer-manager.svg?branch=develop)](https://travis-ci.org/Vizzuality/layer-manager)

# Layer Manager

A library to manage the addition, and removal of layers in Leaflet and Cesium maps (Google coming soon). Furthermore it provides methods to set opacity, visibility, events and more.

## Install

Using npm:

`npm install layer-manager`

or using git:

`npm install vizzuality/layer-manager`


## ❗ Requirements
`layer-manager` requires `react@16.3.2` or higher to work.


You should also install this packages versions to have everything working `deck.gl@7.3.6`, `luma.gl@7.3.2` and `viewport-mercator-project@6.1.1`


## Usage
There are two React components that can be used to help with rendering layers via the layer manager. It can be imported and used as follows:


```js
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapbox } from 'layer-manager';

// map is a reference to whichever map API you are using
// For mapbox this would be an option.
// If you are using React we trully recommend `react-map-gl`
this.map = new Map();

const activeLayers = [
  // GAIN
  {
    id: "gain",
    type: "raster",
    source: {
      tiles: [
        "http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png"
      ]
    }
  },

  // RASTER DECODED
  {
    id: "loss",
    type: "raster",
    source: {
      tiles: [
        "https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png"
      ]
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

  // GEOJSON
  {
    id: "forest_concession",
    type: "geojson",
    source: {
      type: "geojson",
      data: `${process.env.OTP_API}/fmus?country_ids=7,47,45,188,53&format=geojson`
    },
    render: {
      layers: [
        {
          type: "fill",
          source: "forest_concession",
          paint: {
            "fill-color": {
              property: "fmu_type_label",
              type: "categorical",
              stops: [
                ["ventes_de_coupe", "#e92000"],
                ["ufa", "#e95800"],
                ["communal", "#e9A600"],
                ["PEA", "#e9D400"],
                ["CPAET", "#e9E200"],
                ["CFAD", "#e9FF00"]
              ],
              default: "#e98300"
            },
            "fill-opacity": 0.9
          }
        },
        {
          type: "line",
          source: "forest_concession",
          paint: {
            "line-color": "#000000",
            "line-opacity": 0.1
          }
        }
      ]
    }
  },

  // VECTOR WITH CARTO PROVIDER
  {
    id: "protected-areas",
    type: "vector",
    source: {
      type: "vector",
      provider: {
        type: 'carto',
        options: {
          account: "wri-01",
          // api_key: 'añsdlkjfñaklsjdfklñajsdfñlkadjsf',
          layers: [
            {
              options: {
                cartocss: "#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }",
                cartocss_version: "2.3.0",
                sql: "SELECT * FROM wdpa_protected_areas"
              },
              type: "cartodb"
            }
          ]
        }
      },
    },
    render: {
      layers: [
        {
          type: "fill",
          "source-layer": "layer0",
          paint: {
            'fill-color': '#5ca2d1',
            'fill-opacity': 1
          }
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

