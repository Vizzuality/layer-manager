import { fetchData } from 'services/cluster-service';

const GeoJsonLayer = (layerModel) => {
  const {
    layerConfig,
    id,
    decodeClusters,
    cluster
  } = layerModel;

  const layer = {
    id,
    source: {
      type: 'geojson',
      data: layerConfig.body
    },
    layers: layerConfig.layers || [
      // {
      //   id: `${id}-fill`,
      //   type: 'fill',
      //   source: id,
      //   paint: {
      //     'fill-color': 'blue'
      //   }
      // },
      // {
      //   id: `${id}-line`,
      //   type: 'line',
      //   source: id,
      //   paint: {
      //     'line-color': '#000',
      //     'line-width': 2,
      //   }
      // },
      {
        id: 'clusters',
        type: 'circle',
        source: id,
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#f00', 100, '#f1f075', 750, '#f28cb1'
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

  console.log(layerModel);
  if (cluster) {
    return new Promise((resolve, reject) => {
      fetchData(layerModel)
        .then((response) => {
          const features = decodeClusters(response);
          const layerUpdated = {
            ...layer,
            source: {
              ...layer.source,
              data: {
                type: 'FeatureCollection',
                features
              },
              cluster: true,
              clusterMaxZoom: 14, // Max zoom to cluster points on
              clusterRadius: 50,
            }
          };
          resolve(layerUpdated);
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
