import LayerModel from '../src/layer-model';

describe('Layer Model', () => {
  const layerModel = new LayerModel({ opacity: 1 });

  it('set and get attribute', () => {
    layerModel.set('opacity', 0.5);
    expect(layerModel.get('opacity')).toBe(0.5);
  });

  it('update given a layerSpec', () => {
    layerModel.update({ opacity: 0.7 });
    expect(layerModel.get('opacity')).toBe(0.7);
    expect(layerModel['changedAttributes']).toEqual({ opacity: 0.7 }); // the only way to access to a private attribute
  });
});
