import MARKER1 from 'images/marker1.svg';
import MARKER2 from 'images/marker2.svg';

import GL from '@luma.gl/constants';
import { TileLayer, H3ClusterLayer } from '@deck.gl/geo-layers';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import { GridLayer } from '@deck.gl/aggregation-layers';

import DeckLayers from '@vizzuality/layer-manager-layers-deckgl';


const LAYERS = [
  {
    id: 'deck-line-testing',
    name: 'Deck Line',
    config: {
      type: 'deck',
      source: {
        parse: false
      },
      render: {
        parse: false
      },
      deck: [
        {
          id: 'line-layer',
          type: LineLayer,
          data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-segments.json',
          /* props from LineLayer class */

          // getHeight: 1,
          getColor: d => [Math.sqrt(d.inbound), 140, 0],
          getSourcePosition: d => [
            ...d.from.coordinates,
            10
          ],
          getTargetPosition: d => [
            ...d.to.coordinates,
            10
          ],
          // getTilt: 0,
          getWidth: 12,
          // greatCircle: false,
          // widthMaxPixels: Number.MAX_SAFE_INTEGER,
          // widthMinPixels: 0,
          // widthScale: 1,
          // widthUnits: 'pixels',

          /* props inherited from Layer class */

          // autoHighlight: false,
          // coordinateOrigin: [0, 0, 0],
          // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          // highlightColor: [0, 0, 128, 128],
          // modelMatrix: null,
          // opacity: 1,
          pickable: true,
          // visible: true,
          // wrapLongitude: false,
        }
      ]
    },
    legendConfig: {}
  },
  {
    id: 'deck-h3',
    name: 'Deck H3',
    config: {
      type: 'deck',
      source: {
        parse: false
      },
      render: {
        parse: false
      },
      deck: [
        {
          id: 'grid-layer',
          type: H3ClusterLayer,
          data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3clusters.json',
          /* props from H3ClusterLayer class */

          // elevationScale: 1,
          extruded: false,
          filled: true,
          // getElevation: 1000,
          getFillColor: d => [255, (1 - d.mean / 500) * 255, 0],
          getHexagons: d => d.hexIds,
          getLineColor: [255, 255, 255],
          // getLineWidth: 1,
          // lineJointRounded: false,
          // lineMiterLimit: 4,
          // lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
          lineWidthMinPixels: 2,
          // lineWidthScale: 1,
          // lineWidthUnits: 'meters',
          // material: true,
          stroked: true,
          // wireframe: false,

          /* props inherited from Layer class */

          // autoHighlight: false,
          // coordinateOrigin: [0, 0, 0],
          // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          // highlightColor: [0, 0, 128, 128],
          // modelMatrix: null,
          // opacity: 1,
          pickable: true,
          // visible: true,
          // wrapLongitude: false,
        }
      ]
    },
    legendConfig: {}
  },
  {
    id: 'deck-grid',
    name: 'Deck Grid',
    config: {
      type: 'deck',
      source: {
        parse: false
      },
      render: {
        parse: false
      },
      deck: [
        {
          id: 'grid-layer',
          type: GridLayer,
          data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf-bike-parking.json',
          pickable: true,
          extruded: true,
          cellSize: 200,
          elevationScale: 4,
          getPosition: d => d.COORDINATES,
        }
      ]
    },
    legendConfig: {}
  },
  {
    id: 'deck-loss',
    name: 'Deck Loss',
    config: {
      type: 'deck',
      source: {
        parse: false
      },
      render: {
        parse: false
      },
      deck: [
        {
          id: `deck-loss-raster-decode`,
          type: TileLayer,
          data: 'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png',
          tileSize: 256,
          refinementStrategy: 'no-overlap',
          renderSubLayers: (sl) => {
            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity,
              decodeParams: decodeParamsSub,
            } = sl;

            const {
              z,
              bbox: {
                west, south, east, north,
              },
            } = tile;

            if (data) {
              return new DeckLayers.DecodedLayer({
                id: subLayerId,
                image: data,
                bounds: [west, south, east, north],
                textureParameters: {
                  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
                },

                visible,
                zoom: z,
                decodeParams: decodeParamsSub,
                opacity,
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
              });
            }
            return null;
          },
          minZoom: 3,
          maxZoom: 12,
        }
      ]
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
  },

  {
    id: 'deck-scatterplot',
    name: 'Deck Scatterplot',
    config: {
      type: 'deck',
      source: {
        parse: false
      },
      render: {
        parse: false
      },
      deck: [
        {
          id: 'scatterplot-layer',
          type: ScatterplotLayer,
          data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
          /* props from ScatterplotLayer class */

          // filled: true,
          getFillColor: [255, 140, 0],
          getLineColor: [0, 0, 0],
          // getLineWidth: 1,
          getPosition: d => d.coordinates,
          getRadius: d => Math.sqrt(d.exits),
          // lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
          lineWidthMinPixels: 1,
          // lineWidthScale: 1,
          // lineWidthUnits: 'meters',
          radiusMaxPixels: 100,
          radiusMinPixels: 1,
          radiusScale: 6,
          // radiusUnits: 'meters',
          stroked: true,

          /* props inherited from Layer class */

          // autoHighlight: false,
          // coordinateOrigin: [0, 0, 0],
          // coordinateSystem: COORDINATE_SYSTEM.LNGLAT,
          // highlightColor: [0, 0, 128, 128],
          // modelMatrix: null,
          opacity: 0.8,
          pickable: true,
          // visible: true,
          // wrapLongitude: false,
        }
      ]
    },
    legendConfig: {}
  },

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

  // // DECODED RASTER LAYER
  // {
  //   id: 'loss',
  //   name: 'Tree cover loss',
  //   config: {
  //     type: 'raster',
  //     source: {
  //       type: 'raster',
  //       tiles: [
  //         'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png'
  //       ],
  //       minzoom: 3,
  //       maxzoom: 12
  //     }
  //   },
    // legendConfig: {
    //   enabled: true
    // },
    // decodeConfig: [
    //   {
    //     default: '2001-01-01',
    //     key: 'startDate',
    //     required: true
    //   },
    //   {
    //     default: '2018-12-31',
    //     key: 'endDate',
    //     required: true
    //   }
    // ],
    // timelineConfig: {
    //   step: 1,
    //   speed: 250,
    //   interval: 'years',
    //   dateFormat: 'YYYY',
    //   trimEndDate: '2018-12-31',
    //   maxDate: '2018-12-31',
    //   minDate: '2001-01-01',
    //   canPlay: true,
    //   railStyle: {
    //     background: '#DDD'
    //   },
    //   trackStyle: [
    //     {
    //       background: '#dc6c9a'
    //     },
    //     {
    //       background: '#982d5f'
    //     }
    //   ]
    // },
    // decodeFunction: `
    //   // values for creating power scale, domain (input), and range (output)
    //   float domainMin = 0.;
    //   float domainMax = 255.;
    //   float rangeMin = 0.;
    //   float rangeMax = 255.;

    //   float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
    //   float intensity = color.r * 255.;

    //   // get the min, max, and current values on the power scale
    //   float minPow = pow(domainMin, exponent - domainMin);
    //   float maxPow = pow(domainMax, exponent);
    //   float currentPow = pow(intensity, exponent);

    //   // get intensity value mapped to range
    //   float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;
    //   // a value between 0 and 255
    //   alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

    //   float year = 2000.0 + (color.b * 255.);
    //   // map to years
    //   if (year >= startYear && year <= endYear && year >= 2001.) {
    //     color.r = 220. / 255.;
    //     color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
    //     color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
    //   } else {
    //     alpha = 0.;
    //   }
    // `
  // },

  // VECTOR - PROVIDER CARTO
  {
    id: 'protected-areas',
    name: 'Protected areas',
    config: {
      type: 'vector',
      source: {
        type: 'vector',
        promoteId: 'cartodb_id',
        provider: {
          type: 'carto',
          account: 'wri-01',
          layers: [
            {
              options: {
                cartocss: '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
                cartocss_version: '2.3.0',
                sql: 'SELECT * FROM wdpa_protected_areas'
              },
              type: 'mapnik'
            }
          ]
        }
      },
      render: {
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            featureState: {},
            paint: {
              'fill-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#000',
                '#5ca2d1'
              ],
              'fill-color-transition': {
                duration: 300,
                delay: 0
              },
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
    },
    interactionConfig: {
      enabled: true,
      type: 'hover'
    }
  },

  // CUSTOM PROVIDER
  {
    id: 'mongabay-stories',
    name: 'Mongabay stories',
    config: {
      type: 'geojson',
      images: [
        { id: 'lm-marker1', src: MARKER1, options: { sdf: true } },
        { id: 'lm-marker2', src: MARKER2, options: { sdf: true } }
      ],
      source: {
        type: 'geojson',
        promoteId: 'cartodb_id',
        data: 'https://wri-01.carto.com/api/v2/sql?q=SELECT%20*%20FROM%20mongabay&format=geojson',
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 45
      },
      render: {
        metadata: {
          position: 'top'
        },
        layers: [
          {
            id: 'media-clusters',
            metadata: {
              position: 'top'
            },
            type: 'circle',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': '#FFF',
              'circle-stroke-width': 2,
              'circle-stroke-color': [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                '#000',
                '#5ca2d1'
              ],
              'circle-radius': 12
            }
          },
          {
            id: 'media-cluster-count',
            metadata: {
              position: 'top'
            },
            type: 'symbol',
            filter: ['has', 'point_count'],
            layout: {
              'text-allow-overlap': true,
              'text-ignore-placement': true,
              'text-field': '{point_count_abbreviated}',
              'text-size': 12
            }
          },
          {
            id: 'media',
            metadata: {
              position: 'top'
            },
            type: 'symbol',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'icon-color': '#F00'
            },
            layout: {
              'icon-ignore-placement': true,
              'icon-allow-overlap': true,
              'icon-image': 'lm-marker1'
            }
          }
        ]
      }
    },
    paramsConfig: [],
    legendConfig: {
      type: 'basic',
      items: [{ name: 'Mongabay stories', color: '#FFCC00' }]
    },
    interactionConfig: {
      enabled: true,
      type: 'hover'
    }
  },
];

export default LAYERS;