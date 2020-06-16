export default [
  // VECTOR LAYER
  {
    id: 'test',
    name: 'Testing',
    config: {
      type: 'vector',
      source: {
        provider: {
          account: 'skydipper',
          type: 'carto-skydipper',
          layers: [
            {
              options: {
                type: 'cartodb',
                sql: 'SELECT * FROM {table_name} WHERE admin_level = {admin_level}'
              }
            }
          ]
        },
        type: 'vector'
      },
      render: {
        version: '3.0',
        type: 'vector',
        layers: [
          {
            type: 'fill',
            'source-layer': 'layer0',
            paint: {
              'fill-opacity': '{fill_opacity}',
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', '{column_name}'],
                '{break0}',
                '{color0}',
                '{break1}',
                '{color1}',
                '{break2}',
                '{color2}',
                '{break3}',
                '{color3}',
                '{break4}',
                '{color4}',
                '{break5}',
                '{color5}',
                '{break6}',
                '{color6}'
              ]
            }
          },
          {
            type: 'line',
            'source-layer': 'layer0',
            paint: {
              'line-width': '{line_width}',
              'line-color': '{line_color}'
            }
          }
        ]
      }
    },
    params: {
      color6: '#67000D',
      color5: '#CB181D',
      color4: '#EF3B2C',
      color3: '#FB694A',
      color2: '#FC9272',
      color1: '#FCBBA1',
      color0: '#FEE0D2',
      break7: 54.9,
      break6: 49.5,
      break5: 47.3,
      break4: 45.4,
      break3: 43.5,
      break2: 41.5,
      break1: 38.9,
      break0: 31.9,
      line_width: 0.3,
      line_color: 'black',
      fill_opacity: 0.75,
      admin_level: 2,
      column_name: 'max_petmax',
      table_name: 'historical_total_zs_nuts_level_234'
    },

    legendConfig: {
      enable: true
    }
  }
];
