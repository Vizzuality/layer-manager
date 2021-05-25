import { CancelablePromise } from 'cancelable-promise';

import GL from '@luma.gl/constants';
import { MapboxLayer } from '@deck.gl/mapbox';
import { TileLayer } from '@deck.gl/geo-layers';

import { getVectorStyleLayers } from './vector-style-layers';

import DecodedLayer from './custom-layers/decoded-layer';

const RasterLayer = (layerModel, providers) => {
  const {
    source = {}, render = {}, decodeParams, id, opacity, decodeFunction,
  } = layerModel;

  const DEFAULT_RASTER_OPTIONS = {
    id: `${id}-raster`,
    type: 'raster',
    source: id,
  };

  const { provider } = source;

  const {
    layers = [DEFAULT_RASTER_OPTIONS], // Set the default to this to
  } = render;

  let layer = {};

  // if decoded layer use custom deck layer
  if (decodeFunction) {
    layer = {
      id,
      type: 'custom',
      layers: [
        {
          id: `${id}-raster-decode-bg`,
          type: 'background',
          paint: {
            'background-color': 'transparent',
          },
        },
        ...source.tiles.map(
          (t) => new MapboxLayer({
            id: `${id}-raster-decode`,
            type: TileLayer,
            data: t,
            tileSize: 256,
            // refinementStrategy: 'never',
            renderSubLayers: (sl) => {
              const {
                id: subLayerId,
                data,
                tile,
                visible,
                decodeParams: decodeParamsSub,
                decodeFunction: decodeFunctionSub,
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

                  visible,
                  zoom: z,
                  decodeParams: decodeParamsSub,
                  decodeFunction: decodeFunctionSub,
                  opacity,
                });
              }
              return null;
            },
            minZoom: source.minzoom,
            maxZoom: source.maxzoom,
            opacity: layerModel.opacity,
            decodeParams,
            decodeFunction,
          }),
        ),
      ],
    };
  } else {
    layer = {
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tileSize: 256,
        ...source,
      },
      layers: getVectorStyleLayers(
        layers.map((l) => ({
          ...DEFAULT_RASTER_OPTIONS,
          ...l,
        })),
        layerModel,
      ),
    };
  }

  if (provider) {
    const method = providers[provider.type];

    return new CancelablePromise((resolve, reject) => {
      if (!method) {
        reject(
          new Error(
            `${provider.type} provider is not supported. Try to add it to the providers method when you initialize layer-manager`,
          ),
        );
      }

      method.call(this, layerModel, layer, resolve, reject);
    });
  }

  return new CancelablePromise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default RasterLayer;
