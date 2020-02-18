import Promise from 'utils/promise';

import { getVectorStyleLayers } from 'utils/vector-style-layers';
import MapboxLayer from './custom-layers/mapbox-layer';
import TileLayer from './custom-layers/tile-layer';
import DecodedLayer from './custom-layers/decoded-layer';

const getTileData = ({ x, y, z }, url) => {
  const mapSource = url
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  return fetch(mapSource)
    .then(response => response.blob())
    .then(response => {
      const { type } = response || {};
      if (type !== 'application/xml' && type !== 'text/xml' && type !== 'text/html') {
        const src = URL.createObjectURL(response);
        const image = new Image();

        image.src = src;
        return image;
      }

      return false;
    });
};

const RasterLayer = (layerModel, providers) => {
  const { source = {}, render = {}, decodeParams, id, opacity, decodeFunction } = layerModel;

  const DEFAULT_RASTER_OPTIONS = {
    id: `${id}-raster`,
    type: 'raster',
    source: id
  };

  const { provider } = source;

  const {
    layers = [DEFAULT_RASTER_OPTIONS] // Set the default to this to
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
            'background-color': 'transparent'
          }
        },
        ...source.tiles.map(
          t =>
            new MapboxLayer({
              id: `${id}-raster-decode`,
              type: TileLayer,
              getTileData: e => getTileData(e, t),
              renderSubLayers: ({
                id: subLayerId,
                data,
                tile,
                visible,
                zoom,
                decodeParams: decodeParamsSub,
                decodeFunction: decodeFunctionSub
              }) => {
                if (data && data.src) {
                  return new DecodedLayer({
                    id: subLayerId,
                    image: data.src,
                    bounds: tile.bbox,
                    visible,
                    zoom,
                    decodeParams: decodeParamsSub,
                    decodeFunction: decodeFunctionSub,
                    opacity
                  });
                }
                return null;
              },
              minZoom: source.minzoom,
              maxZoom: source.maxzoom,
              opacity: layerModel.opacity,
              decodeParams,
              decodeFunction
            })
        )
      ]
    };
  } else {
    layer = {
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tileSize: 256,
        ...source
      },
      layers: getVectorStyleLayers(
        layers.map(l => ({
          ...DEFAULT_RASTER_OPTIONS,
          ...l
        })),
        layerModel
      )
    };
  }

  if (provider) {
    const method = providers[provider.type];

    return new Promise((resolve, reject) => {
      if (!method) {
        reject(
          new Error(
            `${provider.type} provider is not supported. Try to add it to the providers method when you initialize layer-manager`
          )
        );
      }

      method.call(this, provider, layer, layerModel, resolve, reject);
    });
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default RasterLayer;
