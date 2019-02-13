import { fetchData } from 'services/cluster-service';

const GeoJsonLayer = (layerModel) => {
  const {
    layerConfig,
    id,
    decodeGeoJson,
  } = layerModel;
  const { data, body } = layerConfig || {};
  const { url, vectorLayers, clusterConfig } = body || {};

  let layer = {};

  switch (layerConfig.type) {
    case 'cluster':
      layer = {
        id,
        source: {
          type: 'geojson',
          data: url || data,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 20,
          ...clusterConfig
        },
        layers: vectorLayers ? vectorLayers.map(l => ({
          ...l,
          id: `${id}-${l.id}`,
          source: id,
          ...l.paint && {
            paint: {
              [`${l.type}-opacity`]: l.opacity ? layerModel.opacity * l.opacity : layerModel.opacity,
              ...l.paint
            }
          }
        })) : [
          {
            id: `${id}-clusters`,
            type: 'circle',
            source: id,
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                '#008000', 100, '#f1f075', 750, '#f28cb1'
              ],
              'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
            }
          },
          {
            id: `${id}-cluster-count`,
            type: 'symbol',
            source: id,
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
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
              'circle-radius': 5
            }
          }
        ]
      };
      break;
    default:
      layer = {
        id,
        source: {
          type: 'geojson',
          data: url || data
        },
        layers: vectorLayers ? vectorLayers.map((l, i) => ({
          ...l,
          id: `${id}-${l.type}-${i}`,
          source: id,
          paint: {
            [`${l.type}-opacity`]: l.opacity ? layerModel.opacity * l.opacity : layerModel.opacity,
            ...l.paint
          }
        })) : [
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
      break;
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
