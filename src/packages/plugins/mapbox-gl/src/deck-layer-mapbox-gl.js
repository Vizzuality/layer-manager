import { CancelablePromise } from '@vizzuality/layer-manager-utils';
import MapboxLayer from './custom-layers/mapbox-layer';

const DeckLayer = layerModel => {
  const { deck = [], id, zIndex } = layerModel;

  let layer = {};

  // if decoded layer use custom deck layer

  layer = {
    id,
    type: 'custom',
    layers: [
      {
        id: `${id}-deck-bg`,
        type: 'background',
        paint: {
          'background-color': 'transparent'
        }
      },
      ...deck.map(d => new MapboxLayer({
        ...d,
        getPolygonOffset: () => [0, -zIndex],
      }))
    ]
  };

  return new CancelablePromise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default DeckLayer;
