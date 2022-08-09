import React, { useCallback, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

// Map
import Map from '../../../components/map';

const cartoProvider = new CartoProvider();

export default {
  title: 'Layers/Vector',
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [interactiveLayerIds, setInteractiveLayerIds] = useState();
  const [bounds] = useState(null);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '500px',
      }}
    >
      <Map
        id='map'
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        interactiveLayerIds={interactiveLayerIds}
        onClick={(e) => {
          if (e?.features) {
            console.log(e.features)
          }
        }}
        viewState={viewport}
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onViewStateChange={handleViewportChange}
      >
        {(map) => (
          <LayerManager
            map={map}
            plugin={PluginMapboxGl}
            providers={{
              [cartoProvider.name]: cartoProvider.handleData,
            }}
          >
            <Layer
              {...args}
              onAfterAdd={(layerModel) => {
                if (layerModel?.mapLayer) {
                  const ids = layerModel?.mapLayer?.layers.filter(l => l.interactive).map(l => l.id);
                  setInteractiveLayerIds(ids);
                }
              }}
            />
          </LayerManager>
        )}
      </Map>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  id: 'test-vector',
  type: 'vector',
  source: {
    type: 'vector',
    url: 'mapbox://mapbox.country-boundaries-v1',
  },
  render: {
    layers: [
      {
        interactive: true,
        type: 'fill',
        'source-layer': 'country_boundaries',
        paint: {
          'fill-color': [
            'match',
            ['get', 'region'],
            'Africa',
            '#fbb03b',
            'Americas',
            '#223b53',
            'Europe',
            '#e55e5e',
            'Asia',
            '#3bb2d0',
            'Oceania',
            '#ffcc00',
            /* other */ '#ccc'
            ],
        }
      },
      {
        interactive: true,
        type: 'line',
        'source-layer': 'country_boundaries',
        paint: {
          'line-color': '#000',
          'line-width': 1,
        }
      }
    ]
  },
};

export const WithParams = Template.bind({});
WithParams.args = {
  id: 'test-vector',
  type: 'vector',
  params: {
    color: '#00CC00'
  },
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
            sql: 'SELECT * FROM wdpa_protected_areas',
          },
          type: 'cartodb',
        },
      ],
    }
  },
  render: {
    layers: [
      {
        type: 'fill',
        'source-layer': 'layer0',
        paint: {
          'fill-color': '{{color}}',
          'fill-opacity': 1,
        },
      },
      {
        type: 'line',
        'source-layer': 'layer0',
        paint: {
          'line-color': '#000000',
          'line-opacity': 0.1,
        },
      },
    ]
  }
};


export const WithProviderCarto = Template.bind({});
WithProviderCarto.args = {
  id: 'test-vector',
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
            sql: 'SELECT * FROM wdpa_protected_areas',
          },
          type: 'cartodb',
        },
      ],
    }
  },
  render: {
    layers: [
      {
        type: 'fill',
        'source-layer': 'layer0',
        paint: {
          'fill-color': '#FFCC00',
          'fill-opacity': 1,
        },
      },
      {
        type: 'line',
        'source-layer': 'layer0',
        paint: {
          'line-color': '#000000',
          'line-opacity': 0.1,
        },
      },
    ]
  }
};
