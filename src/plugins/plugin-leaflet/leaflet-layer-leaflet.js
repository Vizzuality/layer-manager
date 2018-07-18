import Promise from 'bluebird';

import { replace } from 'src/helpers';

import CanvasLayer from './canvas-layer-leaflet';


const { L } = window;

const LeafletLayer = (layerModel) => {
  if (!L) throw new Error('Leaflet must be defined.');

  const { layerConfig, params, sqlParams, decodeParams } = layerModel;
  let layer;

  const layerCongigParsed = JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));


  // Transforming data layer
  if (layerCongigParsed.body.crs && L.CRS[layerCongigParsed.body.crs]) {
    layerCongigParsed.body.crs = L.CRS[layerCongigParsed.body.crs.replace(':', '')];
    layerCongigParsed.body.pane = 'tilePane';
  }

  switch (layerCongigParsed.type) {
    case 'wms':
      layer = L.tileLayer.wms(layerCongigParsed.url, layerCongigParsed.body);
      break;
    case 'tileLayer':
      // if (JSON.stringify(layerCongigParsed.body).indexOf('style: "function') >= 0) {
      //   layerCongigParsed.body.style = eval(`(${layerCongigParsed.body.style})`);
      // }
      if (decodeParams) {
        layer = new CanvasLayer({ ...layerModel });
      } else {
        layer = L.tileLayer(layerCongigParsed.url, layerCongigParsed.body);
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

export default LeafletLayer;
