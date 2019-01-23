import { replace } from 'utils/query';

const RasterLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    id
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  const layer = {
    id,
    type: 'raster',
    source: {
      type: 'raster',
      tiles: [layerConfigParsed.url || layerConfigParsed.body.url],
      tileSize: 256,
      ...layerConfigParsed.body
    }
  };

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

export default RasterLayer;
