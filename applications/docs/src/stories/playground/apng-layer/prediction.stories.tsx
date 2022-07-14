
import React, { useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import GL from '@luma.gl/constants';
import { MapboxLayer } from '@deck.gl/mapbox';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

import parseAPNG from 'apng-js';

// Map
import Map from '../../../components/map';
import useInterval from '../../layers/deck/utils';

const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/APNG-Layer',
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const [frame, setFrame] = useState(0);
  const [delay, setDelay] = useState(null);
  const minZoom = 0;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds] = useState({
    bbox: [17.596292980940888, -14.697003230863928, 17.769759604455118, -14.603349846815476],
  });

  useInterval(() => {
    // 1988-2021
    const f = (frame === 34 - 1) ? 0 :  frame + 1;

    setFrame(f);
  }, delay);

  const DECK_LAYERS = useMemo(() => {
    return [
      new MapboxLayer(
        {
          id: `prediction-animated`,
          type: TileLayer,
          frame,
          getTileData: (tile) => {
            const { x, y, z, signal } = tile;
            const url = `https://storage.googleapis.com/geo-ai/Redes/Tiles/Menongue/APNGs/Prediction/${z}/${x}/${y}.png`;
            const response = fetch(url, { signal });

            if (signal.aborted) {
              return null;
            }

            return response
              .then((res) => res.arrayBuffer())
              .then((buffer) => {
                const apng = parseAPNG(buffer);
                if (apng instanceof Error) {
                  throw apng;
                }

                return apng.frames.map((frame) => {
                  return {
                    ...frame,
                    bitmapData: createImageBitmap(frame.imageData),
                  };
                });
              });
          },
          tileSize: 256,
          visible: true,
          opacity: 1,
          refinementStrategy: 'no-overlap',
          renderSubLayers: (sl) => {
            if (!sl) return null;

            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity = 1,
              frame: f
            } = sl;

            if (!tile || !data) return null;

            const {
              z,
              bbox: {
                west, south, east, north,
              },
            } = tile;

            const FRAME = data[f];

            if (FRAME) {
              return new BitmapLayer({
                id: subLayerId,
                image: FRAME.bitmapData,
                bounds: [west, south, east, north],
                textureParameters: {
                  [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                  [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                  [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                  [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
                },
                zoom: z,
                visible,
                opacity,
              });
            }
            return null;
          },
          minZoom: 10,
          maxZoom: 14,
          extent: bounds.bbox,
        }
      )
    ]
  }, [frame]);

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
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          background: '#FEFEFE',
          color: '#000',
          padding: '10px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <button
          type='button'
          onClick={() => {
            setDelay(delay === null ? 200 : null);
          }}
        >
          {!delay && 'Play'}
          {delay && 'Pause'}
        </button>
        <input
          type="range"
          min={1988}
          max={2021}
          value={1988 + frame}
          onChange={(e) => {
            setDelay(null);
            setFrame(+e.target.value - 1988);
          }}
        />
        <span>
          {1988 + frame}
        </span>
      </div>
      <Map
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewport={viewport}
        mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onMapViewportChange={handleViewportChange}
        mapStyle="mapbox://styles/layer-manager/ck53taxwt06mu1csgap96x9rz"
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
              <Layer
                {...args}
                deck={DECK_LAYERS}
              />
            </LayerManager>
          </>
        )}
      </Map>
    </div>
  );
};



export const Prediction = Template.bind({});
Prediction.args = {
  id: 'prediction-layer',
  type: 'deck',
  source: {
    parse: false,
  },
  render: {
    parse: false
  },
  deck: []
};
