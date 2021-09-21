
import React, { useCallback, useState } from 'react';
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
import useInterval from './utils';

const cartoProvider = new CartoProvider();

export default {
  title: 'Layers/Deck',
  argTypes: {
  },
};

const Template: Story<LayerProps> = (args: LayerProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [decodeParams] = useState({
    startYear: 2001,
    endYear: 2017,
  });
  const [bounds] = useState(null);

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
              decodeParams={decodeParams}
            />
          </LayerManager>
        )}
      </Map>
    </div>
  );
};

const AnimatedTemplate: Story<LayerProps> = (args: LayerProps) => {
  const minZoom = 2;
  const maxZoom = 20;
  const [viewport, setViewport] = useState({});
  const [decodeParams, setDecodedParams] = useState({
    startYear: 2001,
    endYear: 2017,
  });
  const [bounds] = useState(null);

  const handleViewportChange = useCallback((vw) => {
    setViewport(vw);
  }, []);

  useInterval(() => {
    const end = (decodeParams.endYear === 2017) ? 2002 : decodeParams.endYear + 1;

    setDecodedParams({
      startYear: 2001,
      endYear: end,
    })
  }, 500);


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
              decodeParams={decodeParams}
            />
          </LayerManager>
        )}
      </Map>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  id: 'test-geojson',
  type: 'deck',
  source: {
    parse: false,
  },
  render: {
    parse: false
  },
  deck: [
    {
      id: `deck-loss-raster-decode`,
      type: TileLayer,
      data: 'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png',
      tileSize: 256,
      visible: true,
      refinementStrategy: 'no-overlap',
      renderSubLayers: (sl) => {
        const {
          id: subLayerId,
          data,
          tile,
          visible,
          opacity,
          decodeParams,
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
            decodeParams: decodeParams || {
              startYear: 2001,
              endYear: 2017,
            },
            decodeFunction: `
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
            `
          });
        }
        return null;
      },
      minZoom: 3,
      maxZoom: 12,
    }
  ]
};


export const Animated = AnimatedTemplate.bind({});
Animated.args = {
  id: 'test-geojson',
  type: 'deck',
  source: {
    parse: false,
  },
  render: {
    parse: false
  },
  deck: [
    {
      id: `deck-loss-raster-decode`,
      type: TileLayer,
      data: 'https://storage.googleapis.com/wri-public/Hansen_16/tiles/hansen_world/v1/tc30/{z}/{x}/{y}.png',
      tileSize: 256,
      visible: true,
      refinementStrategy: 'no-overlap',
      renderSubLayers: (sl) => {
        const {
          id: subLayerId,
          data,
          tile,
          visible,
          opacity,
          decodeParams,
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
            decodeParams: decodeParams || {
              startYear: 2001,
              endYear: 2017,
            },
            decodeFunction: `
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
            `
          });
        }
        return null;
      },
      minZoom: 3,
      maxZoom: 12,
    }
  ]
};