import { replace } from 'utils/query';
import { fetchData } from 'services/cluster-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const GeoJsonLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    id,
    decodeGeoJson
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  const { data, body, type } = layerConfigParsed || {};
  const { url, vectorLayers, clusterConfig } = body || {};

  let layer = {};

  if (['markers', 'cluster'].includes(type)) {
    layer = {
      id,
      source: {
        type: 'geojson',
        data: url || data,
        ...clusterConfig
      },
      layers: vectorLayers ? getVectorStyleLayers(vectorLayers, layerModel) : [
        {
          id: `${id}-clusters`,
          type: 'circle',
          source: id,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#f69',
            'circle-radius': 12
          }
        },
        {
          id: `${id}-cluster-count`,
          type: 'symbol',
          source: id,
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12
          }
        },
        {
          id: `${id}-unclustered-point`,
          type: 'circle',
          source: id,
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#f69',
            'circle-radius': 12
          }
        }
      ]
    };
  } else {
    layer = {
      id,
      source: {
        type: 'geojson',
        data: url || data
      },
      layers: vectorLayers ? getVectorStyleLayers(vectorLayers, layerModel) : [
        {
          id: `${id}-fill`,
          type: 'fill',
          source: id,
          paint: {
            'fill-color': 'blue'
          }
        },
        {
          id: `${id}-line`,
          type: 'line',
          source: id,
          paint: {
            'line-color': '#000',
            'line-width': 2,
          }
        }
      ]
    };
  }

  if (decodeGeoJson) {
    return new Promise((resolve, reject) => {
      fetchData(layerModel)
        .then((response) => {
          const features = decodeGeoJson(response);
          const layerWithData = {
            ...layer,
            source: {
              ...layer.source,
              data: {
                type: 'FeatureCollection',
                features
              }
            }
          };
          resolve(layerWithData);
        })
        .catch(err => reject(err));
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
