
import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
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
import { VideoCollectionPlayer } from './video-player';

const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/WEBM-Layer',
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const videoCollectionPlayer = useRef(null);

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
          frame: 0,
          getTileData: (tile: { x: any; y: any; z: any; }) => {
            const { x, y, z } = tile;
            const url = `https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/WebMs/${z}/${x}/${y}.webm`;

            const video = document.createElement('video');
            video.src = url;
            video.crossOrigin = 'anonymous';
            video.muted = true;
            video.autoplay = false;
            video.loop = false;

            return video;
          },
          tileSize: 256,
          visible: true,
          refinementStrategy: 'no-overlap',
          renderSubLayers: (sl: { id: any; data: any; tile: any; visible: any; opacity: any; frame: any; }, ...rest) => {
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
              updateTriggers: {
                frame: f,
              },
            });

            return VideoBitmapLayer;
          },
          onTileLoad: (tile: any) => {
            videoCollectionPlayer.current.addVideo(tile.data);
          },
          onTileUnload: (tile: any) => {
            videoCollectionPlayer.current.removeVideo(tile.data);
          },
          minZoom: 0,
          maxZoom: 3,
        }
      )
    ]
  }, []);

  const handleViewportChange = useCallback((vw: React.SetStateAction<{}>) => {
    setViewport(vw);
  }, []);

  useEffect(() => {
    videoCollectionPlayer.current = new VideoCollectionPlayer();
    videoCollectionPlayer.current.setCurrentTime(0);
    videoCollectionPlayer.current.onTimeChanged = (frame) => {
      const [layer] = DECK_LAYERS;
      // layer.setProps({ frame });
      layer.map.triggerRepaint();

      setTimeout(() => {
        const f = (frame === 22) ? 0 : frame + 1;
        videoCollectionPlayer.current.setCurrentTime(f);
      }, 50);
    }
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
        onClick={() => {
          const f = Math.floor(Math.random() * 22);
          videoCollectionPlayer.current.setCurrentTime(f);
        }}
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