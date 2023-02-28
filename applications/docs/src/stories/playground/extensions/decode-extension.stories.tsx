
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
import { LayerExtension } from '@deck.gl/core';

// Map
import Map from '../../../components/map';

const cartoProvider = new CartoProvider();

export default {
  title: 'Playground/Extensions',
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
      defaultValue: ``,
      description: 'The decode function you will apply to each tile pixel',
      control: {
        type: 'text'
      }
    }
  },
};

class LossExtension extends LayerExtension {
  getShaders() {
    return {
      inject: {
        'fs:#decl': `
          uniform float zoom;
          uniform float startYear;
          uniform float endYear;
        `,

        'fs:DECKGL_FILTER_COLOR': `
          ${this.props.decodeFunction}
        `
      }
    };
  }

  updateState({ props, changeFlags }) {
    const {
      decodeParams = {},
      zoom
    } = props;

    if (changeFlags.extensionsChanged || changeFlags.somethingChanged.decodeFunction) {
      const { gl } = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager().invalidateAll();
    }

    for (const model of this.getModels()) {
      model.setUniforms({
        zoom,
        ...decodeParams,
      });
    }
  }
}

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
              return new BitmapLayer({
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
                extensions: [new LossExtension()],
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
        viewState={viewport}
        mapStyle="mapbox://styles/mapbox/light-v9"
        mapboxAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        onViewStateChange={handleViewportChange}
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

export const DecodedExtension = Template.bind({});
DecodedExtension.args = {
  id: 'deck-loss-raster-decode',
  type: 'deck',
  decodeFunction: `// values for creating power scale, domain (input), and range (output)
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
  color.a = zoom < 13. ? scaleIntensity / 255. : color.g;

  float year = 2000.0 + (color.b * 255.);

  // map to years
  if (year >= startYear && year <= endYear && year >= 2001.) {
    color.r = 220. / 255.;
    color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
    color.b = (33. - zoom + 153. - intensity / zoom) / 255.;
  } else {
    discard;
  }`
};

export const LossByYear = Template.bind({});
LossByYear.args = {
  id: 'deck-loss-by-year-raster-decode',
  type: 'deck',
  decodeFunction: `// values for creating power scale, domain (input), and range (output)
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
  color.a = zoom < 13. ? scaleIntensity / 255. : color.g;

  float year = 2000.0 + (color.b * 255.);
  float totalYears = 2017. - 2001.;
  float yearFraction = (year - 2001.) / totalYears;

  // map to years
  if (year >= startYear && year <= endYear && year >= 2001.) {
    float b = (33. - zoom + 153. - intensity / zoom) / 255.;
    color.r = 220. / 255.;
    color.g = (72. - zoom + 102. - 3. * scaleIntensity / zoom) / 255.;
    color.b = mix(b, 0., yearFraction);
  } else {
    discard;
  }`
};