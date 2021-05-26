import { CancelablePromise } from 'cancelable-promise';
import { MapboxLayer } from '@deck.gl/mapbox';

const DeckLayer = (layerModel) => {
  const {
    deck = [], id, zIndex, decodeParams,
  } = layerModel;

  const layer = {
    id,
    type: 'custom',
    layers: [
      {
        id: `${id}-deck-bg`,
        type: 'background',
        paint: {
          'background-color': 'transparent',
        },
      },
      ...deck.map((d) => new MapboxLayer({
        ...d,
        decodeParams,
        getPolygonOffset: () => [0, -zIndex],
      })),
    ],
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
