import { LayerModel, LayerSpec } from '@vizzuality/layer-manager';
import mockData from './mock-data.json';

describe('Layer Model', () => {
  // It seems like you have to stringify and then parse
  // when you import JSON files, I didn't find why
  const layerSpec: LayerSpec = JSON.parse(JSON.stringify(mockData));
  const layerModel = new LayerModel(layerSpec);

  it('set and get attribute', () => {
    layerModel.set('opacity', 0.5);
    expect(layerModel.get('opacity')).toBe(0.5);
  });

  it('update given a layerSpec', () => {
    layerModel.update({ opacity: 0.7 });
    expect(layerModel.get('opacity')).toBe(0.7);
    expect(layerModel.changedAttributes).toEqual({ opacity: 0.7 });
  });
});
