import Promise from 'utils/promise';

import { replace } from 'utils/query';
import { fetchTile } from 'services/carto-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const VectorLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    id
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  const { body, url } = layerConfigParsed || {};
  const { vectorLayers } = body || {};

  const layer = {
    id,
    source: {
      type: 'vector',
      ...(url || (body && body.url)) && {
        url: layerConfigParsed.url || layerConfigParsed.body.url
      }
    },
    layers: vectorLayers ? getVectorStyleLayers(vectorLayers, layerModel) : [
      {
        id: `${id}-fill-0`,
        source: id,
        type: 'fill',
        'source-layer': 'layer0',
        paint: {
          'fill-opacity': layerModel.opacity * 0.5 || 0.5,
          'fill-color': '#f69'
        }
      },
      {
        id: `${id}-line-0`,
        source: id,
        type: 'line',
        'source-layer': 'layer0',
        paint: {
          'line-opacity': layerModel.opacity || 1,
          'line-color': '#f69'
        }
      },
      {
        id: `${id}-circle-0`,
        source: id,
        type: 'circle',
        'source-layer': 'layer0',
        paint: {
          'circle-opacity': layerModel.opacity || 1,
          'circle-color': '#f69'
        }
      },
    ]
  };

  if (layerModel.provider === 'cartodb') {
    return new Promise((resolve, reject) => {
      fetchTile(layerModel)
        .then((response) => {
          const tileUrl = `${response.cdn_url.templates.https.url.replace('{s}', 'a')}/${layerConfigParsed.account}/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.mvt`;

          return resolve({
            ...layer,
            source: {
              ...layer.source,
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
