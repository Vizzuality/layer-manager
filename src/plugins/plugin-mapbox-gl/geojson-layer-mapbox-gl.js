import Promise from 'utils/promise';

import { replace } from 'utils/query';
import { fetchGeojsonData } from 'services/geojson-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const GeoJsonLayer = layerModel => {
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
      type: 'geojson',
      ...sourceParsed
    },
    ...renderParsed,
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
              ...sourceParsed,
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
