import { CancelablePromise } from 'cancelable-promise';
import { Deck } from '@deck.gl/core';
import { MapboxLayer } from '@deck.gl/mapbox';

const DeckLayer = (layerModel, map) => {
  const {
    deck = [], id,
  } = layerModel;

  const DECK = new Deck({
    gl: map.painter.context.gl,
    layers: deck,
  });

  const deckLayer = new MapboxLayer({
    id,
    deck: DECK,
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
      deckLayer,
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
