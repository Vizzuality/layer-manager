
import React, { useCallback, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import LAYERS from './layers';

// Map
import Map from '../../../components/map';


const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/All',
  argTypes: {
    deck: {
      table: {
        disable: true
      }
    },
  },
};

const Template: Story<LayerProps> = (args: any) => {
  const { id, tileUrl, decodeFunction, decodeParams } = args;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewState, setViewState] = useState({});
  const [baseMap, setBaseMap] = useState('mapbox://styles/mapbox/light-v9');
  const [visibility, setVisibility] = useState(true);

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <button onClick={() => {
            setBaseMap("mapbox://styles/mapbox/satellite-streets-v11");
          }}>
            Satellite
          </button>
          <button onClick={() => {
            setBaseMap("mapbox://styles/mapbox/light-v9");
          }}>
            Light
          </button>
        </div>

        <div>
          <button onClick={() => {
            setVisibility(!visibility);
          }}>
            Toggle visibility
          </button>
        </div>
      </div>

      <Map
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewState={viewState}
        terrain={{source: 'mapbox-dem', exaggeration: 1.5}}
        mapStyle={baseMap}
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
                <Layer key={l.id} {...l} visibility={visibility} />
              ))}
            </LayerManager>
          </>
        )}
      </Map>
    </div>
  );
};

export const Default = Template.bind({});