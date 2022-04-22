/* eslint-disable */
const LayerManager = require('@vizzuality/layer-manager').default;
const { LayerModel } = require('@vizzuality/layer-manager');

function TestPlugin() {}
TestPlugin.prototype.setParams = () => {};
TestPlugin.prototype.setSQLParams = () => {};
TestPlugin.prototype.add = jest.fn();
TestPlugin.prototype.remove = jest.fn();
TestPlugin.prototype.setSource = jest.fn();
TestPlugin.prototype.setRender = jest.fn();
TestPlugin.prototype.setVisibility = jest.fn();
TestPlugin.prototype.setOpacity = jest.fn();
TestPlugin.prototype.setZIndex = jest.fn();
TestPlugin.prototype.getLayerByType = jest.fn().mockImplementation((type) => {
  if (type !== 'success') {
    return () => ({
      then: () => {},
    });
  }
  const mapLayer = { id: 'YET_ANOTHER_MAP_LAYER' };
  return () => Promise.resolve(mapLayer);
});

describe('Core layer manager', () => {
  const MAP_INSTANCE = {};
  const plugin = new TestPlugin(MAP_INSTANCE);
  const layerManager = new LayerManager(plugin);
  layerManager.requestCancel = jest.fn();

  beforeEach(() => {
    TestPlugin.prototype.add.mockClear();
    TestPlugin.prototype.remove.mockClear();
    TestPlugin.prototype.setSource.mockClear();
    TestPlugin.prototype.setRender.mockClear();
    TestPlugin.prototype.setVisibility.mockClear();
    TestPlugin.prototype.setOpacity.mockClear();
    TestPlugin.prototype.setZIndex.mockClear();
    TestPlugin.prototype.getLayerByType.mockClear();
    layerManager.requestCancel.mockClear();
  });

  it('adds layers to the map with default options', () => {
    const layer = { id: 'layer_0' };

    const layers = layerManager.add(layer);

    expect(layers).toBe(layerManager.layers);
    expect(layers.length).toBe(1);
    expect(layers[0]).toBeInstanceOf(LayerModel);
    expect(layers[0].layerSpec).toEqual({
      zIndex: 0,
      opacity: 1,
      id: layer.id,
      visibility: true,
    });
  });

  it('adds a layer with custom options', () => {
    const customOptions = {
      opacity: 0.5,
      visibility: false,
      zIndex: 22,
      interactivity: true,
      source: {},
      render: {},
      extra: 'wait what?', // is this expected behaviour?
    };
    const layer = { id: 'layer_1' };
    layerManager.add(layer, customOptions);

    expect(layerManager.layers[1]).toEqual({
      ...customOptions,
      id: layer.id,
    });
  });

  it('returns new reference to layers using getLayers', () => {
    const newLayers = [...layerManager.layers];
    layerManager.layers = newLayers;
    expect(layerManager.getLayers()).toBe(newLayers);
  });

  it('removes a layer', () => {
    expect(layerManager.layers.length).toBe(2);
    layerManager.remove('layer_0', jest.fn());
    expect(layerManager.requestCancel).toHaveBeenCalled();
    expect(TestPlugin.prototype.remove).toHaveBeenCalled();
    expect(layerManager.layers.length).toBe(1);
    expect(layerManager.layers[0].id).toMatch('layer_1');
  });

  it('sets layer opacity using plugin', () => {
    const [layer] = layerManager.layers;
    layerManager.setOpacity('layer_1', 0.8);
    expect(TestPlugin.prototype.setOpacity).toHaveBeenCalledWith(layer, 0.8);
  });

  it('sets layer visibility using plugin', () => {
    const [layer] = layerManager.layers;
    layerManager.setVisibility('layer_1', true);
    expect(TestPlugin.prototype.setVisibility).toHaveBeenCalledWith(layer, true);
  });

  it('sets layer z-index using plugin', () => {
    const [layer] = layerManager.layers;
    layerManager.setZIndex('layer_1', 11);
    expect(TestPlugin.prototype.setZIndex).toHaveBeenCalledWith(layer, 11);
  });

  it('ignores updates on missing layerModels and layerModels without mapLayer', () => {
    const changedProps = {
      opacity: 1,
      visibility: true,
      zIndex: 0,
      decodeParams: { stuff: [] },
    };

    layerManager.update('layer_0', changedProps);
    layerManager.update('layer_1', changedProps);
    expect(TestPlugin.prototype.setZIndex).not.toHaveBeenCalled();
    expect(TestPlugin.prototype.setOpacity).not.toHaveBeenCalled();
    expect(TestPlugin.prototype.setVisibility).not.toHaveBeenCalled();
  });

  it('updates the layer and tracks changes in changedAttributes', () => {
    const changedProps = {
      opacity: 1,
      visibility: true,
      zIndex: 0,
    };

    const originalLayer = { ...layerManager.layers[0] };
    // we need a mapLayer in able to update a layer
    const mapLayer = { id: 'A_MAP_LAYER' };
    layerManager.layers[0].mapLayer = mapLayer;
    layerManager.update('layer_1', changedProps);

    expect(TestPlugin.prototype.setZIndex).toHaveBeenCalled();
    expect(TestPlugin.prototype.setOpacity).toHaveBeenCalled();

    // This seems to be a bug, it's not consistent.
    expect(TestPlugin.prototype.setVisibility).toHaveBeenCalled();

    expect(layerManager.layers[0]).toEqual({
      ...originalLayer,
      ...changedProps,
      mapLayer,
      // does it makes sense to save the data? Perhaps only the keys are needed?
      changedAttributes: changedProps,
    });
  });

  it('updates only the decodeParams', () => {
    const originalLayer = { ...layerManager.layers[0] };
    const changedProps = {
      decodeParams: { key: 'someParams' },
    };
    layerManager.update('layer_1', changedProps);

    expect(TestPlugin.prototype.setZIndex).not.toHaveBeenCalled();
    expect(TestPlugin.prototype.setOpacity).not.toHaveBeenCalled();
    expect(TestPlugin.prototype.setVisibility).not.toHaveBeenCalled();

    expect(layerManager.layers[0]).toEqual({
      ...originalLayer,
      ...changedProps,
      // does it makes sense to save the data? Perhaps only the keys are needed?
      changedAttributes: changedProps,
    });
  });

  it('successfully resolves request with a mapLayer and adds it using plugin', async () => {
    const newLayer = {
      id: 'layer_2',
      type: 'vector',
      source: {},
      render: {},
    };
    layerManager.add(newLayer);
    const layer = layerManager.layers[1];
    layer.type = 'success';

    expect(layer.mapLayer).toBeUndefined();

    layerManager.requestLayer(layer, () => {});

    // we need to await the promise before doing assertions within a callback.
    await layerManager.promises[layer.id];

    expect(layerManager.requestCancel).toHaveBeenCalledWith(layer.id);
    expect(TestPlugin.prototype.add).toHaveBeenCalledWith(layer, layerManager.layers);
    expect(TestPlugin.prototype.setZIndex).toHaveBeenCalledWith(layer, layer.zIndex);
    expect(TestPlugin.prototype.setOpacity).toHaveBeenCalledWith(layer, layer.opacity);
    expect(TestPlugin.prototype.setVisibility).toHaveBeenCalledWith(layer, layer.visibility);
    expect(layer.mapLayer.id).toMatch('YET_ANOTHER_MAP_LAYER');
  });
});
