export default [
  // RASTER LAYER
  {
    id: 'gain',
    name: 'Tree cover gain',
    config: {
      type: 'raster',
      source: {
        type: 'raster',
        tiles: ['https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'],
        minzoom: 3,
        maxzoom: 12
      }
    },
    legendConfig: {
      type: 'basic',
      items: [{ name: 'Tree cover gain', color: '#6D6DE5' }]
    }
  },

  // DECODED RASTER LAYER
  {
    id: 'loss',
    name: 'Tree cover loss',
    config: {
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [
          'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png'
        ],
        minzoom: 3,
        maxzoom: 12
      }
    },
    legendConfig: {
      enabled: true
    },
    decodeConfig: [
      {
        default: '2001-01-01',
        key: 'startDate',
        required: true
      },
      {
        default: '2018-12-31',
        key: 'endDate',
        required: true
      }
    ],
    timelineConfig: {
      step: 1,
      speed: 250,
      interval: 'years',
      dateFormat: 'YYYY',
      trimEndDate: '2018-12-31',
      maxDate: '2018-12-31',
      minDate: '2001-01-01',
      canPlay: true,
      railStyle: {
        background: '#DDD'
      },
      trackStyle: [
        {
          background: '#dc6c9a'
        },
        {
          background: '#982d5f'
        }
      ]
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

  // VECTOR - PROVIDER CARTO
  {
    id: 'protected-areas',
    name: 'Protected areas',
    config: {
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
                type: 'mapnik'
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
              'fill-color': '#5ca2d1',
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
    paramsConfig: [],
    legendConfig: {
      type: 'basic',
      items: [{ name: 'Protected areas', color: '#5ca2d1' }]
    }
  },

  // CUSTOM PROVIDER
  {
    id: 'mongabay-stories',
    name: 'Mongabay stories',
    config: {
      type: 'geojson',
      source: {
        type: 'geojson',
        data: 'https://wri-01.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20mongabay&format=geojson',
        // provider: {
        //   type: 'carto-sql-points',
        //   url: 'https://wri-01.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20mongabay&format=geojson',
        //   options: {}
        // }
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
    },
    paramsConfig: [],
    legendConfig: {
      type: 'basic',
      items: [{ name: 'Mongabay stories', color: '#FFCC00' }]
    }
  }
];
