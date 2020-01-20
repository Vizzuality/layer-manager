import Promise from 'utils/promise';

import { replace } from 'utils/query';
import { fetchTile } from 'services/carto-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const VectorLayer = layerModel => {
  const { source = {}, render = {}, params, sqlParams, id } = layerModel;

  const sourceParsed =
    source.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

  const renderParsed =
    render.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

  const { layers } = renderParsed;

  const layer = {
    id,
    source: {
      type: 'vector',
      ...sourceParsed
    },
    ...renderParsed,
    layers: getVectorStyleLayers(layers, layerModel)
  };

  if (sourceParsed.provider === 'cartodb' || sourceParsed.provider === 'carto') {
    return new Promise((resolve, reject) => {
      fetchTile(layerModel)
        .then(response => {
          const tileUrl = `${response.cdn_url.templates.https.url.replace('{s}', 'a')}/${
            sourceParsed.providerOptions.account
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
