import { replace } from 'utils/query';
import { MapboxLayer } from '@deck.gl/mapbox';

import TileLayer from './custom-layers/tile-layer';

const getTileData = ({ x, y, z }, url) => {
  const mapSource = url
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  return fetch(mapSource)
    .then(response => response.blob())
    .then((response) => {
      const src = URL.createObjectURL(response);
      const image = new Image();

      image.src = src;
      return image;
    });
};

const RasterLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    decodeParams,
    id,
    opacity,
    decodeFunction
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
  let tileUrl;

  const { body, url } = layerConfigParsed || {};
  const { paint, minzoom, maxzoom } = body || {};

  switch (layerModel.provider) {
    case 'gee':
      tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;
      break;
    default:
      tileUrl = url || body.url;
      break;
  }

  let layer = {};

  // if decoded layer use custom deck layer
  if (decodeFunction) {
    layer = {
      id,
      layers: [
        new MapboxLayer({
          id,
          type: TileLayer,
          minZoom: minzoom,
          maxZoom: maxzoom,
          getTileData: e => getTileData(e, url || body.url),
          opacity: layerModel.opacity,
          decodeParams
        })
      ]
    };
  } else {
    layer = {
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
      },
      layers: [{
        id: `${id}-raster`,
        type: 'raster',
        source: id,
        ...maxzoom && {
          maxzoom
        },
        ...minzoom && {
          minzoom
        },
        paint: {
          ...paint,
          'raster-opacity': opacity || 1
        }
      }]
    };
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
