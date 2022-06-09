
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
      defaultValue: 'https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/default/{z}/{x}/{y}.png',
      control: {
        type: 'text'
      },
    },
    decodeParams: {
      name: 'decodeParams',
      type: { name: 'object', required: true },
      defaultValue: {
        startDayIndex: 0,
        endDayIndex: 500,
      }
    },
    decodeFunction: {
      name: 'decodeFunction',
      type: { name: 'string', required: true },
      defaultValue: `

  // First 6 bits Alpha channel used to individual alert confidence
  // First two bits (leftmost) are GLAD-L
  // Next, 3rd and 4th bits are GLAD-S2
  // Finally, 5th and 6th bits are RADD
  // Bits are either: 00 (0, no alerts), 01 (1, low conf), or 10 (2, high conf)
  // e.g. 00 10 01 00 --> no GLAD-L, high conf GLAD-S2, low conf RADD

  float agreementValue = alpha * 255.;

  float r = color.r * 255.;
  float g = color.g * 255.;
  float b = color.b * 255.;

  float day = r * 255. + g;
  float confidence = floor(b / 100.) - 1.;
  float intensity = mod(b, 100.) * 50.;

  if (
    day > 0. &&
    day >= startDayIndex &&
    day <= endDayIndex &&
    agreementValue > 0.
  )
  {
    if (intensity > 255.) {
      intensity = 255.;
    }
    // get high and highest confidence alerts
    float confidenceValue = 0.;

    if (agreementValue == 4. || agreementValue == 16. || agreementValue == 64.) {
      // ONE ALERT LOW CONF: 4,8,16,32,64,128 i.e. 2**(2+n) for n<8

      color.r = 237. / 255.;
      color.g = 164. / 255.;
      color.b = 194. / 255.;
      alpha = (intensity -confidenceValue) / 255.;
    } else if (agreementValue == 8. || agreementValue == 32. || agreementValue ==  128.){
      // ONE HIGH CONF ALERT: 8,32,128 i.e. 2**(2+n) for n<8 and odd

      color.r = 220. / 255.;
      color.g = 102. / 255.;
      color.b = 153. / 255.;
      alpha = intensity / 255.;
    } else {
      // MULTIPLE ALERTS: >0 and not 2**(2+n)

      color.r = 201. / 255.;
      color.g = 42. / 255.;
      color.b = 109. / 255.;
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
      new TileLayer(
        {
          id:'integrated',
          data: tileUrl,
          tileSize: 256,
          visible: true,
          refinementStrategy: 'no-overlap',
          decodeFunction,
          decodeParams,
          opacity: 1,
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

export const IntegratedAlerts = Template.bind({});
IntegratedAlerts.args = {
  id: 'deck-integrated-alerts-decode',
  type: 'deck'
};
