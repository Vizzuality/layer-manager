import Promise from 'bluebird';
import { replace } from 'src/helpers';
import CanvasLayer from './canvas-layer-leaflet';

const { L } = window;

const LeafletLayer = (layerModel) => {
  if (!L) throw new Error('Leaflet must be defined.');

  const { layerConfig, params, sqlParams, decodeParams } = layerModel;
  let layer;

  const layerConfigParsed = JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  // Transforming data layer
  if (layerConfigParsed.body.crs && L.CRS[layerConfigParsed.body.crs]) {
    layerConfigParsed.body.crs = L.CRS[layerConfigParsed.body.crs.replace(':', '')];
    layerConfigParsed.body.pane = 'tilePane';
  }

  switch (layerConfigParsed.type) {
    case 'wms':
      layer = L.tileLayer.wms(layerConfigParsed.url || layerConfigParsed.body.url, layerConfigParsed.body);
      break;
    case 'tileLayer':
      if (JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0) {
        layerConfigParsed.body.style = eval(`(${layerConfigParsed.body.style})`); // eslint-disable-line
      }
      if (decodeParams) {
        layer = new CanvasLayer({ ...layerModel });
      } else {
        layer = L.tileLayer(layerConfigParsed.url || layerConfigParsed.body.url, layerConfigParsed.body);
      }
      break;
    default:
      layer = L[layerConfigParsed.type](layerConfigParsed.body);
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
