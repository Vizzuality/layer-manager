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
      'source-layer': l['source-layer'] || 'plantations_all',
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
        'source-layer': 'plantations_all',
        paint: {
          'fill-color': {
            property: 'species_simp',
            type: 'categorical',
            default: '#a0c746',
            stops: [
              ['Oil Palm ', '#fdada9'],
              ['Wood fiber / timber', '#98a7c4'],
              ['Rubber', '#9993a3'],
              ['Fruit', '#dada95'],
              ['Other', '#d1e6ab'],
              ['Wood fiber / timber Mix', '#9ebbf2'],
              ['Oil Palm Mix', '#fcc4c1'],
              ['Rubber Mix', '#a4fdff'],
              ['Fruit Mix', '#fefe97'],
              ['Other Mix', '#e1efc8'],
              ['Unknown', '#dcd9d9'],
              ['Recently cleared', '#d5a6ea']
            ]
          },
          'fill-opacity': layerModel.opacity
        }
      },
      // {
      //   id: `${id}-line`,
      //   type: 'line',
      //   source: id,
      //   'source-layer': 'plantations_all',
      //   paint: {
      //     'line-color': '#f69',
      //     'line-opacity': layerModel.opacity,
      //     'line-width': 2
      //   }
      // }
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
