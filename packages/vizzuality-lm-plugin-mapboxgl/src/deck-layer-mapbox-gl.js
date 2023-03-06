import { CancelablePromise } from 'cancelable-promise';

const DeckLayer = (layerModel) => {
  const {
    deck = [], id,
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
      ...deck,
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
