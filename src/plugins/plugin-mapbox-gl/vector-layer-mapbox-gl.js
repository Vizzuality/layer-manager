import { replace } from 'utils/query';
import { fetchTile } from 'services/carto-service';

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

  const layer = {
    id,
    source: {
      type: 'vector',
      ...(url || body.url) && {
        url: layerConfigParsed.url || layerConfigParsed.body.url
      }
    },
    layers: layerConfigParsed.layers ? layerConfigParsed.layers.map(l => ({
      ...l,
      id: `${id}-${l.type}`,
      source: id,
      'source-layer': l['source-layer'] || 'layer0',
      paint: {
        [`${l.type}-opacity`]: layerModel.opacity,
        [`${l.type}-color`]: '#f69',
        ...l.paint,
      }
    })) : [
      {
        id: `${id}-fill`,
        type: 'fill',
        source: id,
        'source-layer': 'layer0',
        paint: {
          'fill-color': '#f69',
          'fill-opacity': layerModel.opacity
        }
      },
      {
        id: `${id}-line`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        paint: {
          'line-color': '#f69',
          'line-opacity': layerModel.opacity
        }
      }
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
