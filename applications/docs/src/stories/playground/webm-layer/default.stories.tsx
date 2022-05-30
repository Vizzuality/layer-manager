
import React, { useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import GL from '@luma.gl/constants';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';

// Map
import Map from '../../../components/map';

import { useEffect } from 'react';
import { useRef } from 'react';

const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/WEBM-Layer',
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const frame = useRef(0);
  const frameAnimation = useRef(null);

  const minZoom = 0;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [bounds] = useState(null);

  const DECK_LAYERS = useMemo(() => {
    return [
      new MapboxLayer(
        {
          id: `deck-loss-raster-decode-animated`,
          type: TileLayer,
          data: 'https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/WebMs/{z}/{x}/{y}.webm',
          frame,
          getTileData: (tile) => {
            const { x, y, z } = tile;
            const url = `https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/WebMs/${z}/${x}/${y}.webm`;

            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = 'anonymous';
            video.muted = true;
            video.autoplay = true;
            video.loop = true;

            return video;
          },
          tileSize: 256,
          visible: true,
          refinementStrategy: 'no-overlap',
          renderSubLayers: (sl) => {
            if (!sl) return null;

            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity,
              frame: f
            } = sl;

            if (!tile || !data) return null;

            const {
              z,
              bbox: {
                west, south, east, north,
              },
            } = tile;

            const VideoBitmapLayer = new BitmapLayer({
              id: subLayerId,
              image: data,
              bounds: [west, south, east, north],
              textureParameters: {
                [GL.TEXTURE_MIN_FILTER]: GL.LINEAR_MIPMAP_LINEAR,
                [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
                [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
              },
              mipmaps: false,
              zoom: z,
              visible,
              opacity,
            });

            // data.play();
            // data.addEventListener('loadeddata', () => {
            //   data.play();
            // })

            // data.addEventListener('timeupdate', () => {
            //   if (!data.paused) return;
            // })

            // data.addEventListener('seeking', (event) => {
            //   console.log(event);
            //   data.currentTime = `${(f / 1000) * data.duration}`;
            // })

            if (data.readyState === 4) {
              // data.play();
              data.currentTime = `${(f / 100) * data.duration}`;
              console.log(f, data.currentTime);
            }


            return VideoBitmapLayer;
          },
          minZoom: 0,
          maxZoom: 5,
        }
      )
    ]
  }, []);

  const updateFrame = () => {
    frame.current = (frame.current === 100) ? 0 :  frame.current + 1;

    const [layer] = DECK_LAYERS;
    if (layer && typeof layer.setProps === 'function') {
      layer.setProps({
        frame: frame.current,
      });
    }
    setTimeout(updateFrame, 50);
  };


  useEffect(() => {
    updateFrame();
  }, []);


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