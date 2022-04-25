
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import GL from '@luma.gl/constants';
import { TileLayer } from '@deck.gl/geo-layers';
import { DecodedLayer } from '@vizzuality/layer-manager-layers-deckgl';
import { MapboxLayer } from '@deck.gl/mapbox';


// Map
import Map from '../../../components/map';

const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/Decoded-Raster-Layer',
  argTypes: {
    deck: {
      table: {
        disable: true
      }
    },
    tileUrl: {
      name: 'tileUrl',
      type: { name: 'Tile URL', required: true },
      defaultValue: 'https://tiles.globalforestwatch.org/glad_prod/tiles/{z}/{x}/{y}.png',
      control: {
        type: 'text'
      },
    },
    decodeParams: {
      name: 'decodeParams',
      type: { name: 'object', required: true },
      defaultValue: {
        startDayIndex: 0,
        endDayIndex: 1150,
      }
    },
    decodeFunction: {
      name: 'decodeFunction',
      type: { name: 'string', required: true },
      defaultValue: `
      // values for creating power scale, domain (input), and range (output)
      float day = color.r * 255. * 255. + (color.g * 255.);
      float confidence = color.b * 255.;

      if (
        day > 0. &&
        day >= startDayIndex &&
        day <= endDayIndex
      ) {
        // get intensity
        float intensity = mod(confidence, 100.) * 50.;
        if (intensity > 255.) {
          intensity = 255.;
        }
        if (confidence < 200.) {
          color.r = 237. / 255.;
          color.g = 164. / 255.;
          color.b = 194. / 255.;
          alpha = intensity / 255.;
        } else {
          color.r = 220. / 255.;
          color.g = 102. / 255.;
          color.b = 153. / 255.;
          alpha = intensity / 255.;
        }
      } else {
        alpha = 0.;
      }
    `,
      description: 'The decode function you will apply to each tile pixel',
      control: {
        type: 'text'
      }
    }
  },
};

const Template: Story<LayerProps> = (args: any) => {
  const { tileUrl, decodeFunction, decodeParams } = args;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});

  const [bounds] = useState(null);

  const DECK_LAYERS = useMemo(() => {
    return [
      new MapboxLayer(
        {
          id:'glad-alerts',
          type: TileLayer,
          data: tileUrl,
          tileSize: 256,
          visible: true,
          refinementStrategy: 'no-overlap',
          decodeFunction,
          decodeParams,
          renderSubLayers: (sl) => {
            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity,
              decodeFunction: dFunction,
              decodeParams: dParams
            } = sl;

            const {
              z,
              bbox: {
                west, south, east, north,
              },
            } = tile;

            if (data) {
              return new DecodedLayer({
                id: subLayerId,
                image: data,
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
                decodeParams: dParams,
                decodeFunction: dFunction,
                updateTriggers: {
                  decodeParams: dParams,
                  decodeFunction: dFunction,
                },
              });
            }
            return null;
          },
          minZoom: 3,
          maxZoom: 12,
        }
      )
    ]
  }, []);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  useEffect(() => {
    const [layer] = DECK_LAYERS;
    if (layer && typeof layer.setProps === 'function') {
      layer.setProps({
        decodeParams,
        decodeFunction
      });
    }
  }, [decodeParams, decodeFunction])

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

export const Glad = Template.bind({});
Glad.args = {
  id: 'deck-glad-alerts-decode',
  type: 'deck'
};
