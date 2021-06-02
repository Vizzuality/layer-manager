import { CancelablePromise } from 'cancelable-promise';
import { getVectorStyleLayers } from './vector-style-layers';

const RasterLayer = (layerModel, providers) => {
  const {
    source = {}, render = {}, id,
  } = layerModel;

  const DEFAULT_RASTER_OPTIONS = {
    id: `${id}-raster`,
    type: 'raster',
    source: id,
  };

  const { provider } = source;

  const {
    layers = [DEFAULT_RASTER_OPTIONS], // Set the default to this to
  } = render;

  const layer = {
    id,
    type: 'raster',
    source: {
      type: 'raster',
      tileSize: 256,
      ...source,
    },
    layers: getVectorStyleLayers(
      layers.map((l) => ({
        ...DEFAULT_RASTER_OPTIONS,
        ...l,
      })),
      layerModel,
    ),
  };

  if (provider) {
    const method = providers[provider.type];

    return new CancelablePromise((resolve, reject) => {
      if (!method) {
        reject(
          new Error(
            `${provider.type} provider is not supported. Try to add it to the providers method when you initialize layer-manager`,
          ),
        );
      }

      method.call(this, layerModel, layer, resolve, reject);
    });
  }

  return new CancelablePromise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default RasterLayer;
