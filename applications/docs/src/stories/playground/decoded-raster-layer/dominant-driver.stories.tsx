
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
      defaultValue: 'https://tiles.globalforestwatch.org/tsc_tree_cover_loss_drivers/v2020/tcd_30/{z}/{x}/{y}.png',
      control: {
        type: 'text'
      },
    },
    decodeParams: {
      name: 'decodeParams',
      type: { name: 'object', required: true },
      defaultValue: {
        startYear: 2001,
        endYear: 2017,
      }
    },
    decodeFunction: {
      name: 'decodeFunction',
      type: { name: 'string', required: true },
      defaultValue: `
      float year = 2000.0 + (color.b * 255.);
      // map to years
      if (year >= startYear && year <= endYear && year >= 2001.) {
        // values for creating power scale, domain (input), and range (output)
        float domainMin = 0.;
        float domainMax = 255.;
        float rangeMin = 0.;
        float rangeMax = 255.;

        float exponent = zoom < 13. ? 0.3 + (zoom - 3.) / 20. : 1.;
        float intensity = color.r * 255.;

        // get the min, max, and current values on the power scale
        float minPow = pow(domainMin, exponent - domainMin);
        float maxPow = pow(domainMax, exponent);
        float currentPow = pow(intensity, exponent);

        // get intensity value mapped to range
        float scaleIntensity = ((currentPow - minPow) / (maxPow - minPow) * (rangeMax - rangeMin)) + rangeMin;

        // a value between 0 and 255
        alpha = scaleIntensity * 2. / 255.;
        float lossCat = color.g * 255.;

        float r = 255.;
        float g = 255.;
        float b = 255.;

        if (lossCat == 1.) {
          r = 244.;
          g = 29.;
          b = 54.;
        } else if (lossCat == 2.) {
          r = 239.;
          g = 211.;
          b = 26.;
        } else if (lossCat == 3.) {
          r = 47.;
          g = 191.;
          b = 113.;
        } else if (lossCat == 4.) {
          r = 173.;
          g = 104.;
          b = 36.;
        } else if (lossCat == 5.) {
          r = 178.;
          g = 53.;
          b = 204.;
        }

        color.r = r / 255.;
        color.g = g / 255.;
        color.b = b / 255.;
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
          id:'tcl-by-dominant-driver',
          type: TileLayer,
          data: tileUrl,
          tileSize: 256,
          visible: true,
          refinementStrategy: 'no-overlap',
          decodeParams,
          decodeFunction,
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
                }
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
        decodeFunction,
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

export const DominantDriver = Template.bind({});
DominantDriver.args = {
  id: 'deck-loss-byDriver-decode',
  type: 'deck'
};
