import Promise from 'utils/promise';

import { replace } from 'utils/query';
import { fetchData } from 'services/cluster-service';
import { getVectorStyleLayers } from 'utils/vector-style-layers';

const GeoJsonLayer = layerModel => {
  const { source = {}, render = {}, params, sqlParams, id, decodeGeoJson } = layerModel;

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

  if (decodeGeoJson) {
    return new Promise((resolve, reject) => {
      fetchData(layerModel)
        .then(response => {
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
