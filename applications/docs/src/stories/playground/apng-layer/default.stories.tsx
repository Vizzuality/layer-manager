
import React, { useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import GL from '@luma.gl/constants';
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
  const minZoom = 0;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds] = useState(null);

  useInterval(() => {
    const f = (frame === 22 - 1) ? 0 :  frame + 1;

    setFrame(f);
  }, 100);

  const DECK_LAYERS = useMemo(() => {
    return [
      new TileLayer(
        {
          id: `deck-loss-raster-decode-animated`,
          frame,
          data: 'https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/APNGs/{z}/{x}/{y}.png',
          getTileData: (tile) => {
            const { x, y, z, signal } = tile;
            const url = `https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/APNGs/${z}/${x}/${y}.png`;
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
          minZoom: 0,
          maxZoom: 3,
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
      <Map
        bounds={bounds}
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewport={viewport}
        mapboxApiAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onMapViewportChange={handleViewportChange}
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

export const Default = Template.bind({});
Default.args = {
  id: 'raster-decode-layer',
  type: 'deck',
  source: {
    parse: false,
  },
  render: {
    parse: false
  },
  deck: []
};
