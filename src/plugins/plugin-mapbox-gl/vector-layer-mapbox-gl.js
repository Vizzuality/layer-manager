import { replace } from 'utils/query';

const VectorLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    id,
    interactionConfig
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
  console.log(layerModel);
  let layer = {};
  switch (layerConfigParsed.type) {
    case 'vector':
      layer = {
        id,
        source: {
          type: 'vector',
          url: 'mapbox://resourcewatch.bln11gj7'
        },
        layer: {
          id,
          type: 'fill',
          source: id,
          'source-layer': 'plantations_all',
          paint: {
            'fill-color': '#f69',
            'fill-opacity': layerModel.opacity
          },
          interactivity: interactionConfig
        }
      };
      break;
    default:
      break;
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

export default VectorLayer;
