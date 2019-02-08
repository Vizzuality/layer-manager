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
    layers: layerConfigParsed.layers ? layerConfigParsed.layers.map((l, i) => ({
      ...l,
      id: `${id}-${l.type}-${i}`,
      source: id,
      paint: {
        [`${l.type}-opacity`]: l.opacity ? layerModel.opacity * l.opacity : layerModel.opacity,
        ...l.paint,
      }
    })) : [
      {
        id: `${id}-fill-0`,
        type: 'fill',
        source: id,
        'source-layer': 'layer0',
        paint: {
          'fill-color': 'transparent',
          'fill-opacity': layerModel.opacity
        }
      },
      {
        id: `${id}-line-0`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 3,
        filter: ['==', 'level', 0],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-1`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 3,
        filter: ['all', ['==', 'size', 'huge'], ['==', 'level', 0]],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-2`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 4,
        filter: ['all', ['==', 'size', 'very big'], ['==', 'level', 0]],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-3`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 5,
        filter: ['all', ['==', 'size', 'big'], ['==', 'level', 0]],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-4`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 6,
        filter: ['all', ['==', 'size', 'medium'], ['==', 'level', 0]],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-5`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 7,
        filter: ['all', ['==', 'size', 'small'], ['==', 'level', 0]],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-6`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        maxzoom: 8,
        filter: ['all', ['==', 'size', 'very small'], ['==', 'level', 0]],
        paint: {
          'line-color': '#7f7f7f',
          'line-opacity': layerModel.opacity,
          'line-width': 0.7
        }
      },
      {
        id: `${id}-line-7`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 2,
        maxzoom: 5,
        filter: ['all', ['==', 'size', 'huge'], ['==', 'level', 1]],
        paint: {
          'line-color': '#8b8b8b',
          'line-opacity': layerModel.opacity,
          'line-width': 0.3
        }
      },
      {
        id: `${id}-line-8`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 3,
        maxzoom: 6,
        filter: ['all', ['==', 'size', 'very big'], ['==', 'level', 1]],
        paint: {
          'line-color': '#8b8b8b',
          'line-opacity': layerModel.opacity,
          'line-width': 0.3
        }
      },
      {
        id: `${id}-line-9`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 4,
        maxzoom: 7,
        filter: ['all', ['==', 'size', 'big'], ['==', 'level', 1]],
        paint: {
          'line-color': '#8b8b8b',
          'line-opacity': layerModel.opacity,
          'line-width': 0.3
        }
      },
      {
        id: `${id}-line-10`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 5,
        maxzoom: 8,
        filter: ['all', ['==', 'size', 'medium'], ['==', 'level', 1]],
        paint: {
          'line-color': '#8b8b8b',
          'line-opacity': layerModel.opacity,
          'line-width': 0.3
        }
      },
      {
        id: `${id}-line-11`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 6,
        maxzoom: 8,
        filter: ['all', ['==', 'size', 'small'], ['==', 'level', 1]],
        paint: {
          'line-color': '#8b8b8b',
          'line-opacity': layerModel.opacity,
          'line-width': 0.3
        }
      },
      {
        id: `${id}-line-12`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 7,
        maxzoom: 9,
        filter: ['all', ['==', 'size', 'very small'], ['==', 'level', 1]],
        paint: {
          'line-color': '#8b8b8b',
          'line-opacity': layerModel.opacity,
          'line-width': 0.3
        }
      },
      {
        id: `${id}-line-13`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 4,
        filter: ['all', ['==', 'size', 'huge'], ['==', 'level', 2]],
        paint: {
          'line-color': '#444444',
          'line-opacity': layerModel.opacity,
          'line-width': 0.5,
          'line-dasharray': [2, 4]
        }
      },
      {
        id: `${id}-line-14`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 5,
        filter: ['all', ['==', 'size', 'very big'], ['==', 'level', 2]],
        paint: {
          'line-color': '#444444',
          'line-opacity': layerModel.opacity,
          'line-width': 0.5,
          'line-dasharray': [2, 4]
        }
      },
      {
        id: `${id}-line-15`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 6,
        filter: ['all', ['==', 'size', 'big'], ['==', 'level', 2]],
        paint: {
          'line-color': '#444444',
          'line-opacity': layerModel.opacity,
          'line-width': 0.5,
          'line-dasharray': [2, 4]
        }
      },
      {
        id: `${id}-line-16`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 7,
        filter: ['all', ['==', 'size', 'medium'], ['==', 'level', 2]],
        paint: {
          'line-color': '#444444',
          'line-opacity': layerModel.opacity,
          'line-width': 0.5,
          'line-dasharray': [2, 4]
        }
      },
      {
        id: `${id}-line-17`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 7,
        filter: ['all', ['==', 'size', 'small'], ['==', 'level', 2]],
        paint: {
          'line-color': '#444444',
          'line-opacity': layerModel.opacity,
          'line-width': 0.5,
          'line-dasharray': [2, 4]
        }
      },
      {
        id: `${id}-line-18`,
        type: 'line',
        source: id,
        'source-layer': 'layer0',
        minzoom: 8,
        filter: ['all', ['==', 'size', 'very small'], ['==', 'level', 2]],
        paint: {
          'line-color': '#444444',
          'line-opacity': layerModel.opacity,
          'line-width': 0.5,
          'line-dasharray': [2, 4]
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
