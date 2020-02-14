import Promise from 'utils/promise';

import { fetchGeojsonData } from 'services/geojson-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const GeoJsonLayer = layerModel => {
  const { source = {}, render = {}, id } = layerModel;

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

  if (source.parse && typeof source.parse === 'function') {
    return new Promise((resolve, reject) => {
      fetchGeojsonData(layerModel)
        .then(response => {
          const data = source.parse(response);

          const layerWithData = {
            ...layer,
            source: {
              type: 'geojson',
              ...source,
              data
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
