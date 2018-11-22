import Promise from 'bluebird';
import { replace } from 'utils/query';
import CanvasLayer from './canvas-layer-leaflet';
import ClusterLayer from './cluster-layer-leaflet';

import UTFGridLayer from './utf-grid-layer-leaflet';

const { L } = typeof window !== 'undefined' ? window : {};
const eval2 = eval;

const LeafletLayer = layerModel => {
  if (!L) throw new Error('Leaflet must be defined.');

  const {
    layerConfig,
    params,
    sqlParams,
    decodeParams,
    interactivity
  } = layerModel;
  let layer;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  // Transforming data layer
  if (layerConfigParsed.body.crs && L.CRS[layerConfigParsed.body.crs]) {
    layerConfigParsed.body.crs = L.CRS[layerConfigParsed.body.crs.replace(
      ':',
      ''
    )];
    layerConfigParsed.body.pane = 'tilePane';
  }

  switch (layerConfigParsed.type) {
    case 'wms':
      layer = L.tileLayer.wms(
        layerConfigParsed.url || layerConfigParsed.body.url,
        layerConfigParsed.body
      );
      break;
    case 'tileLayer':
      if (
        JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0
      ) {
        layerConfigParsed.body.style = eval2(
          `(${layerConfigParsed.body.style})`
        );
      }
      if (decodeParams) {
        layer = new CanvasLayer({ ...layerModel });
      } else {
        layer = L.tileLayer(
          layerConfigParsed.url || layerConfigParsed.body.url,
          layerConfigParsed.body
        );
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
          }
        });

        layer = new LayerGroup([ layer, interactiveLayer ]);
      }

      break;
    case 'cluster':
      if (
        JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0
      ) {
        layerConfigParsed.body.style = eval2(
          `(${layerConfigParsed.body.style})`,
        );
      }
      layer = new ClusterLayer({ ...layerModel });
      break;
    default:
      layer = L[layerConfigParsed.type](
        layerConfigParsed.body,
        layerConfigParsed.options || {}
      );
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
