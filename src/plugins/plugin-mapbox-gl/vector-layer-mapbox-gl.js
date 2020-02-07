import Promise from 'utils/promise';

import { fetchCartoAnonymous } from 'services/carto-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const VectorLayer = layerModel => {
  const { source = {}, render = {}, id } = layerModel;

  const { provider } = source;

  const { layers } = render;

  const layer = {
    id,
    source: {
      type: 'vector',
      ...source
    },
    ...render,
    layers: getVectorStyleLayers(layers, layerModel)
  };

  if (provider && (provider.type === 'cartodb' || provider.type === 'carto')) {
    return new Promise((resolve, reject) => {
      fetchCartoAnonymous(layerModel)
        .then(response => {
          const tileUrl = `${response.cdn_url.templates.https.url.replace('{s}', 'a')}/${
            provider.options.account
          }/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.mvt`;

          return resolve({
            ...layer,
            source: {
              type: 'vector',
              tiles: [tileUrl]
            }
          });
        })
        .catch(err => reject(err));
    });
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default VectorLayer;
