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


##  :scissors: Usage
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
    id: "gain",
    type: "raster",
    source: {
      tiles: [
        "http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png"
      ],
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
    id: "loss",
    type: "raster",
    source: {
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

  // GEOJSON LAYER
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

  // GEOJSON DATA LAYER
  {
    id: 'multipolygon',
    type: 'geojson',
    source: {
      type: 'geojson',
      data: {
        "type": "MultiPolygon",
        "coordinates": [
          [
            [
              [
                32.34306503300007,
                2.123437977000037
              ],
              [
                32.44647248900003,
                1.994041393000032
              ],
              [
                32.43668315800005,
                1.837412087000075
              ],
              [
                32.304527181000026,
                1.710150776000035
              ],
              [
                32.28494851800008,
                1.587784131000035
              ],
              [
                32.08916188500007,
                1.48499614800005
              ],
              [
                31.94841496500004,
                1.530303754000045
              ],
              [
                31.90247744800007,
                1.622178789000031
              ],
              [
                31.88358592000003,
                1.891253411000037
              ],
              [
                31.94429102600003,
                1.979271416000074
              ],
              [
                31.686096191000047,
                2.014099121000072
              ],
              [
                31.507690429000036,
                2.04968261700003
              ],
              [
                31.305908203000058,
                2.150512696000021
              ],
              [
                31.364929200000063,
                2.27569580100004
              ],
              [
                31.345886231000065,
                2.485107422000056
              ],
              [
                31.414123536000034,
                2.800476074000073
              ],
              [
                31.57032730700007,
                2.924027900000056
              ],
              [
                31.861511231000065,
                2.791076660000044
              ],
              [
                32.166076660000044,
                2.667297363000046
              ],
              [
                32.36590576200007,
                2.534118652000075
              ],
              [
                32.42309570300006,
                2.343688965000069
              ],
              [
                32.34306503300007,
                2.123437977000037
              ]
            ]
          ],
          [
            [
              [
                34.12142187000006,
                3.291488321000031
              ],
              [
                33.892993614000034,
                3.284349938000048
              ],
              [
                33.76450271900006,
                3.462809514000071
              ],
              [
                33.65742697400003,
                3.591300408000052
              ],
              [
                33.69311888900006,
                3.776898367000058
              ],
              [
                33.77877948500003,
                3.883974112000033
              ],
              [
                33.92701794000004,
                3.909908332000043
              ],
              [
                34.02659936600003,
                3.681600001000049
              ],
              [
                34.17139055100006,
                3.626992323000024
              ],
              [
                34.19994408400004,
                3.469947897000054
              ],
              [
                34.12142187000006,
                3.291488321000031
              ]
            ]
          ],
          [
            [
              [
                31.224899075000053,
                -0.463464512999963
              ],
              [
                31.14450842100007,
                -0.647214579999968
              ],
              [
                30.983727112000054,
                -0.624245820999931
              ],
              [
                30.891852079000046,
                -0.624245820999931
              ],
              [
                30.834430183000052,
                -0.624245820999931
              ],
              [
                30.788492666000025,
                -0.601277062999941
              ],
              [
                30.891852079000046,
                -0.383073857999932
              ],
              [
                30.995211492000067,
                -0.360105099999942
              ],
              [
                31.14450842100007,
                -0.371589478999965
              ],
              [
                31.178961558000026,
                -0.417526994999946
              ],
              [
                31.224899075000053,
                -0.463464512999963
              ]
            ]
          ],
          [
            [
              [
                36.822110112000075,
                -0.63581206799995
              ],
              [
                36.76024412600003,
                -0.647709372999941
              ],
              [
                36.68886029500004,
                -0.626294224999924
              ],
              [
                36.66142034000006,
                -0.589762951999944
              ],
              [
                36.634997086000055,
                -0.527022380999938
              ],
              [
                36.66650795700008,
                -0.503860280999959
              ],
              [
                36.71012313600005,
                -0.474709466999968
              ],
              [
                36.781559145000074,
                -0.462482131999934
              ],
              [
                36.81259226800006,
                -0.438316804999943
              ],
              [
                36.90063232500006,
                -0.416901655999936
              ],
              [
                36.94346262300007,
                -0.466870336999932
              ],
              [
                36.96963669400003,
                -0.523977400999968
              ],
              [
                36.94346262300007,
                -0.583463926999968
              ],
              [
                36.822110112000075,
                -0.63581206799995
              ]
            ]
          ],
          [
            [
              [
                36.70075760000003,
                -0.357415130999925
              ],
              [
                36.63175323100006,
                -0.374071357999981
              ],
              [
                36.57575974400004,
                -0.297089248999953
              ],
              [
                36.54847209600007,
                -0.219406392999929
              ],
              [
                36.56512832300007,
                -0.131366334999939
              ],
              [
                36.60795862100008,
                -0.083777114999975
              ],
              [
                36.65554784200003,
                -0.076638731999935
              ],
              [
                36.69599867800008,
                -0.088536037999972
              ],
              [
                36.72455221100006,
                -0.138504718999968
              ],
              [
                36.738828976000036,
                -0.193232320999925
              ],
              [
                36.744582997000066,
                -0.276059158999942
              ],
              [
                36.70075760000003,
                -0.357415130999925
              ]
            ]
          ],
          [
            [
              [
                37.019605375000026,
                0.722860166000032
              ],
              [
                36.95773938900004,
                0.677650407000044
              ],
              [
                36.87207879300007,
                0.68716825100006
              ],
              [
                36.81021280700003,
                0.734757471000023
              ],
              [
                36.80069496300007,
                0.801382379000074
              ],
              [
                36.84114580000005,
                0.848971599000038
              ],
              [
                36.96480161900007,
                0.877174758000024
              ],
              [
                37.03856491000005,
                0.856949340000028
              ],
              [
                37.09812758900006,
                0.796623457000067
              ],
              [
                37.019605375000026,
                0.722860166000032
              ]
            ]
          ],
          [
            [
              [
                38.15691158300007,
                -0.397026610999944
              ],
              [
                38.08909694400006,
                -0.397026610999944
              ],
              [
                38.05340502800004,
                -0.347057929999949
              ],
              [
                38.16761915600006,
                -0.254258949999951
              ],
              [
                38.231864604000066,
                -0.261397332999934
              ],
              [
                38.23543379500006,
                -0.31136601399993
              ],
              [
                38.203311072000076,
                -0.361334694999925
              ],
              [
                38.15691158300007,
                -0.397026610999944
              ]
            ]
          ],
          [
            [
              [
                37.30744400400005,
                -1.503475977999926
              ],
              [
                37.23962936500004,
                -1.571290616999931
              ],
              [
                37.18252230100006,
                -1.553444659999968
              ],
              [
                37.16110715100007,
                -1.514183552999953
              ],
              [
                37.178953109000076,
                -1.474922446999926
              ],
              [
                37.22892179000007,
                -1.414246190999961
              ],
              [
                37.25033693900008,
                -1.435661339999967
              ],
              [
                37.30744400400005,
                -1.503475977999926
              ]
            ]
          ],
          [
            [
              [
                34.848271054000065,
                1.030649992000065
              ],
              [
                34.801871564000066,
                1.027080801000068
              ],
              [
                34.75547207400007,
                1.055634333000057
              ],
              [
                34.76261045700005,
                1.087757057000033
              ],
              [
                34.79116399000003,
                1.144864121000069
              ],
              [
                34.82685590500006,
                1.123448972000062
              ],
              [
                34.876824586000055,
                1.102033823000056
              ],
              [
                34.86611701100003,
                1.06991110000007
              ],
              [
                34.848271054000065,
                1.030649992000065
              ]
            ]
          ]
        ]
      }
    },
    render: {
      layers: [
        {
          type: "fill",
          // "source-layer": "layer0",
          paint: {
            'fill-color': '#FFBB00',
            'fill-opacity': 1
          }
        },
        {
          type: "line",
          // "source-layer": "layer0",
          paint: {
            "line-color": "#000000",
            "line-opacity": 0.1
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
            'fill-color': '{color}',
            'fill-opacity': 1
          }
        },
        {
          type: "line",
          "source-layer": "layer0",
          paint: {
            "line-color": "#000000",
            "line-opacity": 0.1
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
    onAfterAdd: (layerModel) => {
      // do stuff with the layerModel
    },
    id: "species",
    type: "vector",
    source: {
      type: "vector",
      provider: {
        type: 'carto',
        options: {
          account: "simbiotica",
          // api_key: 'añsdlkjfñaklsjdfklñajsdfñlkadjsf',
          layers: [
            {
              options: {
                sql: `WITH a AS (SELECT cartodb_id, the_geom_webmercator, uuid, iso3 FROM all_geometry {{where}}) SELECT a.the_geom_webmercator, a.cartodb_id, b.uuid, b.timeinterval as year, b.species, b.scenario, b.probabilityemca FROM {iso3}_zonal_spp_uuid as b INNER JOIN a ON b.uuid = a.uuid {{where2}}`
              },
              type: 'cartodb'
            }
          ]
        }
      },
    },
    render: {
      layers: [
        {
          filter: ['==', 'year', `{year}`],
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

