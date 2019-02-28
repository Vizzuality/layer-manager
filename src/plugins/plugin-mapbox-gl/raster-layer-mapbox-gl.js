import { replace } from 'utils/query';
import DeckLayer from './deckgl-layer-mapbox-gl';

const RasterLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    id,
    opacity,
    decodeFunction
  } = layerModel;

  if (decodeFunction) {
    return new Promise((resolve) => {
      resolve(DeckLayer(layerModel));
    });
  }

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

  const layer = {
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

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default RasterLayer;
