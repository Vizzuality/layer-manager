import { useCallback, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';

// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

// Map
import Map from '../../../components/map';

const cartoProvider = new CartoProvider();

export default {
  title: 'Layers/Geojson',
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
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
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewport={viewport}
        mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onMapViewportChange={handleViewportChange}
      >
        {(map) => (
          <LayerManager
            map={map}
            plugin={PluginMapboxGl}
            providers={{
              [cartoProvider.name]: cartoProvider.handleData,
            }}
          >
            <Layer {...args} />
          </LayerManager>
        )}
      </Map>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  id: 'test-geojson',
  type: 'geojson',
  source: {
    type: 'geojson',
    data: {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [
                  6.6796875,
                  52.696361078274485
                ],
                [
                  -5.625,
                  40.97989806962013
                ],
                [
                  -7.3828125,
                  22.59372606392931
                ],
                [
                  17.9296875,
                  1.0546279422758869
                ],
                [
                  48.8671875,
                  22.268764039073968
                ],
                [
                  73.828125,
                  45.583289756006316
                ],
                [
                  6.6796875,
                  52.696361078274485
                ]
              ]
            ]
          }
        }
      ]
    },
  },
  render: {
    layers: [
      {
        type: 'fill',
        paint: {
          'fill-color': '#F00'
        }
      }
    ]
  }
};
