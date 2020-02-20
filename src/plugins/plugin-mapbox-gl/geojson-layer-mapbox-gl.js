import Promise from 'utils/promise';

import { getVectorStyleLayers } from 'utils/vector-style-layers';

const GeoJsonLayer = (layerModel, providers) => {
  const { source = {}, render = {}, id } = layerModel;
  const { provider } = source;
  const { layers } = render;

  const layer = {
    id,
    source: {
      type: 'geojson',
      ...source
    },
    ...render,
    layers: getVectorStyleLayers(layers, layerModel)
  };

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

      method.call(this, layerModel, layer, resolve, reject);
    });
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

export default GeoJsonLayer;
