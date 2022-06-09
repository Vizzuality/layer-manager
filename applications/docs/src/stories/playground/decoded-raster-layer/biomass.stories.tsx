
import React, { useCallback, useMemo, useState } from 'react';
import { Story } from '@storybook/react/types-6-0';
// Layer manager
import { LayerManager, Layer, LayerProps } from '@vizzuality/layer-manager-react';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

import GL from '@luma.gl/constants';
import { TileLayer } from '@deck.gl/geo-layers';
import { DecodedLayer } from '@vizzuality/layer-manager-layers-deckgl';


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
      defaultValue: 'https://storage.googleapis.com/wri-public/biomass/global/2017/v2/30/{z}/{x}/{y}.png',
      control: {
        type: 'text'
      },
    },
    decodeParams: {
      name: 'decodeParams',
      type: { name: 'object', required: true },
      defaultValue: {
      }
    },
    decodeFunction: {
      name: 'decodeFunction',
      type: { name: 'string', required: true },
      defaultValue: `
      float intensity = color.b * 255.;
      color.r = (255. - intensity) / 255.;
      color.g = 128. / 255.;
      color.b = 0.;
      alpha = intensity / 255.;
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
  const [changeLayer, setChangeLayer] = useState(false);

  const [bounds] = useState(null);

  const DECK_LAYERS = useMemo(() => {
    if (changeLayer) return [];
    return [
      new TileLayer(
        {
          id:'tree-biomass-density',
          data: tileUrl,
          tileSize: 256,
          visible: true,
          opacity: 1,
          refinementStrategy: 'no-overlap',
          decodeParams,
          decodeFunction,
          renderSubLayers: (sl) => {
            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity: _opacity,
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
                opacity: _opacity,
                decodeParams: dParams,
                decodeFunction: dFunction,
              });
            }
            return null;
          },
          minZoom: 3,
          maxZoom: 12,
        }
      )
    ]
  }, [decodeFunction, decodeParams, changeLayer]);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  console.log('DECK_LAYERS', DECK_LAYERS)

  return (
    <>
      <button type="button" onClick={() => {
        setChangeLayer(!changeLayer)
      }}>Change layer</button>
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
    </>
  );
};

export const BiomassDensity = Template.bind({});
BiomassDensity.args = {
  id: 'deck-tree-biomass-density',
  type: 'deck'
};
