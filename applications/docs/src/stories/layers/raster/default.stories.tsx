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
  title: 'Layers/Raster',
  component: Map,
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds, setBounds] = useState({
    bbox: [
      10.5194091796875,
      43.6499881760459,
      10.9588623046875,
      44.01257086123085,
    ],
    options: {
      padding: 50,
    },
    viewportOptions: {
      transitionDuration: 0,
    },
  });

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
        // mapStyle="mapbox://styles/marxan/ckn4fr7d71qg817kgd9vuom4s"
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
  id: 'gain',
  type: 'raster',
  source: {
    type: 'raster',
    tiles: [
      'http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png',
    ],
  },
};

export const MinMaxZoom = Template.bind({});
MinMaxZoom.args = {
  id: 'gain',
  type: 'raster',
  source: {
    type: 'raster',
    tiles: [
      'http://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png',
    ],
    minzoom: 3,
    maxzoom: 12,
  },
};
