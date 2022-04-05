import { CancelablePromise } from 'cancelable-promise';
import { MapboxLayer } from '@deck.gl/mapbox';

const DeckLayer = (layerModel) => {
  const {
    deck = [], id, zIndex,
  } = layerModel;

  const deckLayers = deck.map((d) => {
    const l = new MapboxLayer({
      ...d,
      getPolygonOffset: () => [0, -zIndex],
    });
    return l;
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
