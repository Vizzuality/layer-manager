/* eslint no-underscore-dangle: ["error", { "allow": ["_currentImage", "_image"] }] */
import Promise from 'bluebird';
import { replace } from 'lib/query';

import LeafletLayer from './leaflet-layer-leaflet';
import UTFGridLayer from './utf-grid-layer-leaflet';

const { L } = typeof window !== 'undefined' ? window : {};
const eval2 = eval;

const EsriLayer = (layerModel) => {
  if (!L) throw new Error('Leaflet must be defined.');
  if (!L.esri) {
    throw new Error(
      'To support this layer you should add esri library for Leaflet.'
    );
  }

  // Preparing layerConfig
  const { layerConfig, interactivity, params, sqlParams } = layerModel;
  const layerConfigParsed = (layerConfig.parse === false) ? layerConfig : JSON.parse(
    replace(JSON.stringify(layerConfig), params, sqlParams)
  );

  const bodyStringified = JSON
    .stringify(layerConfigParsed.body || {})
    .replace(/"mosaic-rule":/g, '"mosaicRule":')
    .replace(/"mosaic_rule":/g, '"mosaicRule":')
    .replace(/"use-cors":/g, '"useCors":')
    .replace(/"use_cors":/g, '"useCors":');

  // If type is a method of leaflet, returns LeafletLayer
  if (L[layerConfigParsed.type]) return new LeafletLayer({ ...layerModel });

  return new Promise((resolve, reject) => {
    if (!L.esri[layerConfigParsed.type]) { return reject(new Error('"type" specified in layer spec doesn`t exist')); }

    const layerOptions = JSON.parse(bodyStringified);
    layerOptions.pane = 'tilePane';
    layerOptions.useCors = true;
    // forcing cors
    if (layerOptions.style && layerOptions.style.indexOf('function') >= 0) {
      layerOptions.style = eval2(`(${layerOptions.style})`);
    }

    let layer;

    layer = L.esri[layerConfigParsed.type](layerOptions);

    if (layer) {
      // Little hack to set zIndex at the beginning
      layer.on('load', () => {
        layer.setZIndex(layerModel.zIndex);
      });

      layer.on('requesterror', err => console.error(err));
    } else {
      return reject();
    }

    if (!layer.setZIndex) {
      layer.setZIndex = (zIndex) => {
        if (layer._currentImage) {
          layer._currentImage._image.style.zIndex = zIndex;
        }
      };
    }

    // Add interactivity
    if (interactivity) {
      const interactiveLayer = new UTFGridLayer();

      const LayerGroup = L.LayerGroup.extend({
        group: true,
        setOpacity: (opacity) => {
          layerModel.mapLayer.getLayers().forEach((l) => {
            l.setOpacity(opacity);
          });
        }
      });

      layer = new LayerGroup([layer, interactiveLayer]);
    }

    return resolve(layer);
  });
};

export default EsriLayer;
