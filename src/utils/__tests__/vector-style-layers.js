import { getVectorStyleLayers } from 'utils/vector-style-layers';

describe('Returns mountable layers with id and opacity applied', () => {
  const LAYER_MODEL = { id: 1234, opacity: 0.5 };
  const VECTOR_LAYER = {
    paint: {
      'fill-color': '#ee9587',
      'fill-opacity': 0.7
    },
    'source-layer': 'layer0',
    type: 'fill'
  };

  it('returns false when no vectorLayers provided', () => {
    const noVectorLayers = getVectorStyleLayers(null, LAYER_MODEL);
    const emptyVectorLayers = getVectorStyleLayers([], LAYER_MODEL);

    expect(noVectorLayers).toBe(false);
    expect(emptyVectorLayers).toBe(false);
  });

  it('returns an id, layer source and layer model opacity applied up to 0.99', () => {
    const [layer] = getVectorStyleLayers([VECTOR_LAYER], LAYER_MODEL);
    expect(layer).toEqual({
      ...VECTOR_LAYER,
      source: LAYER_MODEL.id,
      id: `${LAYER_MODEL.id}-${VECTOR_LAYER.type}-0`,
      paint: {
        ...VECTOR_LAYER.paint,
        'fill-opacity': VECTOR_LAYER.paint['fill-opacity'] * LAYER_MODEL.opacity * 0.99
      }
    });
  });

  it('sets null and undefined paint opacity props as 1', () => {
    const nullFillOpacityLayer = {
      ...VECTOR_LAYER,
      paint: {
        ...VECTOR_LAYER.paint,
        'fill-opacity': null
      }
    };

    const undefinedFillOpacityLayer = {
      ...VECTOR_LAYER,
      paint: {
        ...VECTOR_LAYER.paint,
        'fill-opacity': undefined
      }
    };
    const [layer0, layer1] = getVectorStyleLayers(
      [nullFillOpacityLayer, undefinedFillOpacityLayer],
      LAYER_MODEL
    );

    expect(layer0.paint['fill-opacity']).toBe(LAYER_MODEL.opacity * 0.99);
    expect(layer1.paint['fill-opacity']).toBe(LAYER_MODEL.opacity * 0.99);
  });

  it('removes paint props that are falsy', () => {
    const falsyPaintPropsLayer = {
      ...VECTOR_LAYER,
      paint: {
        ...VECTOR_LAYER.paint,
        'plain-false': false,
        'falsy-because-zero': 0, // is this the expected behaviour?
        'falsy-because-nan': NaN,
        'falsy-because-null': null,
        'falsy-because-undefined': undefined
      }
    };

    const [layer] = getVectorStyleLayers([falsyPaintPropsLayer], LAYER_MODEL);
    expect(layer.paint).toEqual({
      ...VECTOR_LAYER.paint,
      'fill-opacity': VECTOR_LAYER.paint['fill-opacity'] * LAYER_MODEL.opacity * 0.99
    });
  });
});
