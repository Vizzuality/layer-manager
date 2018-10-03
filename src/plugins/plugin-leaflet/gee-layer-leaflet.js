import Promise from 'bluebird';
import { replace } from 'utils/query';

import CanvasLayer from './canvas-layer-leaflet';
import UTFGridLayer from './utf-grid-layer-leaflet';

const { L } = typeof window !== 'undefined' ? window : {};

const GEELayer = layerModel => {
  if (!L) throw new Error('Leaflet must be defined.');

  const {
    id,
    layerConfig,
    interactivity,
    params,
    sqlParams,
    decodeParams,
  } = layerModel;
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;
  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
  let layer;

  switch (layerConfigParsed.type) {
    case 'tileLayer':
      if (decodeParams) {
        layer = new CanvasLayer({ ...layerModel });
      } else {
        layer = L.tileLayer(tileUrl, layerConfigParsed.body);
      }
      break;
    default:
      layer = L.tileLayer(tileUrl, layerConfigParsed.body);
      break;
  }

  // Add interactivity
  if (interactivity) {
    const interactiveLayer = new UTFGridLayer();

    const LayerGroup = L.LayerGroup.extend({
      group: true,
      setOpacity: opacity => {
        layerModel.mapLayer.getLayers().forEach(l => {
          l.setOpacity(opacity);
        });
      },
    });

    layer = new LayerGroup([ layer, interactiveLayer ]);
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
