
import React, { useCallback, useMemo, useState } from 'react';
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
      defaultValue: 'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png',
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
      defaultValue: `// values for creating power scale, domain (input), and range (output)
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
alpha = zoom < 13. ? scaleIntensity / 255. : color.g;

float year = 2000.0 + (color.b * 255.);
// map to years
if (year >= startYear && year <= endYear && year >= 2001.) {
  color.r = 220. / 255.;
  color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
  color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
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
  const { id, tileUrl, decodeFunction, decodeParams } = args;

  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});

  const [bounds] = useState(null);

  const DECK_LAYERS = useMemo(() => {
    return [
      new MapboxLayer(
        {
          id,
          type: TileLayer,
          data: tileUrl,
          tileSize: 256,
          visible: true,
          opacity: 1,
          refinementStrategy: 'no-overlap',
          decodeFunction,
          decodeParams,
          renderSubLayers: (sl) => {
            const {
              id: subLayerId,
              data,
              tile,
              visible,
              opacity: _opacity,
              decodeParams: dParams,
              decodeFunction: dFunction,
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
  }, [decodeFunction, decodeParams]);

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

export const Default = Template.bind({});
Default.args = {
  id: 'deck-loss-raster-decode',
  type: 'deck'
};
