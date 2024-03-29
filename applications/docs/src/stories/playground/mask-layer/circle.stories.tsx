
import React, { useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import GL from '@luma.gl/constants';
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer, GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';
import { MapboxLayer } from '@deck.gl/mapbox';
import { MaskExtension } from '@deck.gl/extensions';
import {CSVLoader} from '@loaders.gl/csv';

import circleToPolygon from 'circle-to-polygon';

// Map
import Map from '../../../components/map';

const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/Mask-Layer',
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
  const [viewport, setViewport] = useState({});
  const [circleCenter, setCircleCenter] = useState([0,0]);

  const [bounds] = useState(null);

  const CIRCLE_POLYGON = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: circleToPolygon(circleCenter, 1000000),
        }
      ]
    }
  }, [circleCenter]);

  const DECK_LAYERS = useMemo(() => {
    return [
      new MapboxLayer({
        type: GeoJsonLayer,
        id: 'mask',
        data: CIRCLE_POLYGON,
        operation: 'mask',
      }),
      new MapboxLayer({
        id: 'deck-gain-layer',
        type: TileLayer,
        data: 'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png',
        opacity: 1,
        tileSize: 256,
        visible: true,

        renderSubLayers: (sl) => {
          const {
            id: subLayerId,
            data,
            tile,
            visible,
            opacity = 1,
          } = sl;

          const {
            z,
            bbox: {
              west, south, east, north,
            },
          } = tile;

          if (data) {
            return new BitmapLayer({
              id: subLayerId,
              image: data,
              bounds: [west, south, east, north],
              extensions: [new MaskExtension()],
              maskId: 'mask',
              textureParameters: {
                [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE,
              },
              zoom: z,
              visible,
              opacity,
              getPolygonOffset: () => [0, -1],
            });
          }
          return null;
        },
        minZoom: 3,
        maxZoom: 12,
      }),
      new MapboxLayer({
        id: 'selected-cities',
        type: ScatterplotLayer,
        data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/cities15000.csv',
        getPosition: d => [d.longitude, d.latitude],
        getPointRadius: d => Math.sqrt(d.population),
        getFillColor: [255, 0, 128],
        radiusMinPixels: 1,
        pickable: true,
        loaders: [CSVLoader],
        maskId: 'mask',
        extensions: [new MaskExtension()],
        getPolygonOffset: () => [0, -2],
      }),
    ]
  }, [CIRCLE_POLYGON])

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  const handleMouseMove = useCallback((e) => {
    setCircleCenter(e.lngLat.toArray());
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
        viewState={viewport}
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onViewStateChange={handleViewportChange}
        onMouseMove={handleMouseMove}
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
              deck={DECK_LAYERS}
            />
          </LayerManager>
        )}
      </Map>
    </div>
  );
};

export const Circle = Template.bind({});
Circle.args = {
  id: 'deck-loss-mask',
  type: 'deck'
};
