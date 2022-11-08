
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
  const [biiOpacity, setBiiOpacity] = useState(1);
  const [biiChangeOpacity, setHumanFootprintOpacity] = useState(1);


  const [frame, setFrame] = useState(0);
  const [delay, setDelay] = useState(null);
  const minZoom = 10;
  const maxZoom = 14;
  const [viewport, setViewport] = useState({});
  const [bounds] = useState({
    bbox: [29.882812499999986, -2.1088986592431382, 30.5859375, -1.75753681130829994],
    options: {
      duration: 0,
    }
  });

  useInterval(() => {
    // 2017-2020
    const f = (frame === 4 - 1) ? 0 :  frame + 1;

    setFrame(f);
  }, delay);

  const DECK_LAYERS = useMemo(() => {
    return [
      new MapboxLayer(
        {
          id: `prediction-animated`,
          type: TileLayer,
          frame,
          getPolygonOffset: () => {
            return [0, -50];
          },


          getTileData: (tile) => {
            const { x, y, z, signal } = tile;
            const url = `https://storage.googleapis.com/geo-ai/Redes/Tiles/Kigali/APNGs/Sentinel/${z}/${x}/${y}.png`;
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
                getPolygonOffset: () => {
                  return [0, -50];
                },
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
      ),
      new MapboxLayer(
        {
          id: `BII-animated`,
          type: TileLayer,
          frame,
          getPolygonOffset: () => {
            return [0, -50];
          },


          getTileData: (tile) => {
            const { x, y, z, signal } = tile;
            const url = `https://storage.googleapis.com/geo-ai/Redes/Tiles/Kigali/BII/APNGs/${z}/${x}/${y}.png`;
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
          opacity: biiOpacity,
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
                getPolygonOffset: () => {
                  return [0, -50];
                },
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
      ),
    ]
  }, [frame, biiOpacity]);

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
      {/* Timeline */}
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
            setDelay(delay === null ? 1000 : null);
          }}
        >
          {!delay && 'Play'}
          {delay && 'Pause'}
        </button>
        <input
          type="range"
          min={2017}
          max={2020}
          value={2017 + frame}
          onChange={(e) => {
            setDelay(null);
            setFrame(+e.target.value - 2017);
          }}
        />
        <span>
          {2017 + frame}
        </span>
      </div>

            {/* Layers */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          background: '#FEFEFE',
          color: '#000',
          padding: '10px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div>
          <label htmlFor='#loss-layer'>BII - 2017-2020</label>
          <input
            type="checkbox"
            checked={!!biiOpacity}
            onChange={(e) => {
              setBiiOpacity(e.target.checked ? 1 : 0);
            }}
          />
        </div>
        <div>
          <label htmlFor='#loss-layer'>BII Change - 2017-2020</label>
          <input
            type="checkbox"
            checked={!!biiChangeOpacity}
            onChange={(e) => {
              setHumanFootprintOpacity(e.target.checked ? 1 : 0);
            }}
          />
        </div>
      </div>


      <Map
        minZoom={minZoom}
        maxZoom={maxZoom}
        viewState={viewport}
        mapStyle="mapbox://styles/layer-manager/ck53taxwt06mu1csgap96x9rz"
        mapboxAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        initialViewState={{
          bounds: [29.882812499999986, -2.1088986592431382, 30.5859375, -1.75753681130829994],
        }}
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
              {/* <Layer
                id= 'biodiversity-intactness'
                type= 'raster'
                source= {{
                  type: 'raster',
                  tiles: [
                    'https://storage.googleapis.com/geo-ai/Redes/Tiles/Kigali/BII/{z}/{x}/{y}.png'
                  ]
                }}
                opacity={biiOpacity}
              /> */}
              <Layer
                id= 'bii-change'
                type= 'raster'
                source= {{
                  type: 'raster',
                  tiles: [
                    'https://storage.googleapis.com/geo-ai/Redes/Tiles/Kigali/BII/{z}/{x}/{y}.png'
                  ]
                }}
                opacity={biiChangeOpacity}
              />
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



export const Kigali = Template.bind({});
Kigali.args = {
  id: 'kigali-layer',
  type: 'deck',
  source: {
    parse: false,
  },
  render: {
    parse: false
  },
  deck: []
};
