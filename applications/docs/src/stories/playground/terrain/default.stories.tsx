
import React, { useCallback, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import LAYERS from './layers';

// Map
import Map from '../../../components/map';
import { Source as RMGLSource, Layer as RMGLLayer } from 'react-map-gl';
import type { SkyLayer } from 'react-map-gl';


const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/Terrain-Layer',
  argTypes: {
    deck: {
      table: {
        disable: true
      }
    },
  },
};

const skyLayer: SkyLayer = {
  id: 'sky',
  type: 'sky',
  paint: {
    'sky-type': 'atmosphere',
    'sky-atmosphere-sun': [0.0, 0.0],
    'sky-atmosphere-sun-intensity': 15
  }
};

const Template: Story<LayerProps> = (args: any) => {
  const { id, tileUrl, decodeFunction, decodeParams } = args;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewState, setViewState] = useState({});

  const [bounds] = useState(null);

  const handleViewportChange = useCallback((vw) => {
    setViewState(vw);
  }, []);

  return (
    <div
      key={JSON.stringify({
        id, tileUrl, decodeFunction, decodeParams
      })}
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
        viewState={viewState}
        terrain={{source: 'mapbox-dem', exaggeration: 1.5}}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v11"
        mapboxAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onViewStateChange={handleViewportChange}
      >
        {(map) => (
          <>
            <LayerManager
              map={map}
              plugin={PluginMapboxGl}
              providers={{
                [cartoProvider.name]: cartoProvider.handleData,
              }}
            >
              {LAYERS.map((l) => (
                <Layer key={l.id} {...l} />
              ))}
            </LayerManager>


            <RMGLLayer {...skyLayer} />

            <RMGLSource
              id="mapbox-dem"
              type="raster-dem"
              url="mapbox://mapbox.mapbox-terrain-dem-v1"
              tileSize={512}
              maxzoom={14}
            />
          </>
        )}
      </Map>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  id: 'deck-loss-mask',
  type: 'deck'
};
