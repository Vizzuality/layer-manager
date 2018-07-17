import Promise from 'bluebird';

import CanvasLayer from '../canvas-layer/canvas-layer-leaflet';

const GEELayer = (layerModel) => {
  const { id, layerConfig, decodeParams } = layerModel;
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;
  let layer;

  switch (layerConfig.type) {
    case 'tileLayer':
      if (decodeParams) {
        layer = new CanvasLayer({ ...layerModel });
      } else {
        layer = L.tileLayer(tileUrl, layerConfig.body);
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
