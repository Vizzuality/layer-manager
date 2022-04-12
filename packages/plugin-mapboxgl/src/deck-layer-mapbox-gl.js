import { CancelablePromise } from 'cancelable-promise';

const DeckLayer = (layerModel) => {
  const {
    deck = [], id, zIndex,
  } = layerModel;

  const deckLayers = deck.map((d) => {
    if (d && typeof d.setProps === 'function') {
      d.setProps({
        getPolygonOffset: () => [0, -zIndex],
      });
    }
    return d;
  });

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
      ...deckLayers,
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
