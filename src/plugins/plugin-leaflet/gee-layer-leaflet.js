import Promise from 'bluebird';
import { replace } from 'src/lib/query';

import CanvasLayer from './canvas-layer-leaflet';

const { L } = window;

const GEELayer = layerModel => {
  if (!L) throw new Error('Leaflet must be defined.');

  const { id, layerConfig, params, sqlParams, decodeParams } = layerModel;
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;
  const layerCongigParsed = JSON.parse(
    replace(JSON.stringify(layerConfig), params, sqlParams)
  );
  let layer;

  switch (layerCongigParsed.type) {
    case 'tileLayer':
      if (decodeParams) {
        layer = new CanvasLayer({ ...layerModel });
      } else {
        layer = L.tileLayer(tileUrl, layerCongigParsed.body);
      }
      break;
    default:
      break;
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

export default GEELayer;
