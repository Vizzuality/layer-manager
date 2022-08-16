
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
      defaultValue: 'https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png',
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

class TestExtension extends LayerExtension {
  getShaders() {
    return {
      inject: {
        'vs:#decl': `
          varying vec4 vTexWorld;
          varying vec3 vTexWorldCommon;
        `,
        'vs:#main-end': `
          vTexWorld = project_position_to_clipspace(positions, positions64Low, vec3(0.0), geometry.position);
          vTexWorldCommon = positions.xyz;
        `,
        'fs:#decl': `
          varying vec4 vTexWorld;
          varying vec3 vTexWorldCommon;
          uniform float zoom;
          uniform float startYear;
          uniform float endYear;
        `,

        'fs:#main-end': `
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
                extensions: [new TestExtension()],
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

export const TestVarying = Template.bind({});
TestVarying.args = {
  id: 'deck-loss-raster-decode',
  type: 'deck',
  decodeFunction: `// decode function
  vec3 color = mix(bitmapColor.rgb, vec3(1.0,0.0,0.0), vTexWorld.x);
  // vec3 color = mix(bitmapColor.rgb, vec3(1.0,0.0,0.0), (abs(vTexWorldCommon.x / 180.)));
  gl_FragColor = vec4(color, bitmapColor.a);
  `
};

export const TestStep = Template.bind({});
TestStep.args = {
  id: 'deck-loss-raster-decode',
  type: 'deck',
  decodeFunction: `// decode function
  float step = step(0., vTexWorldCommon.y);
  vec3 color = mix(bitmapColor.rgb, vec3(1.0,0.0,0.0), step);
  gl_FragColor = vec4(color, bitmapColor.a);
  `
};

