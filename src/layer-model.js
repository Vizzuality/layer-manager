class LayerModel {
  constructor(layerSpec) {
    Object.keys(layerSpec).forEach(k => {
      this.set(k, layerSpec[k]);
    });
  }

  get(key) {
    return this[key];
  }

  set(key, value) {
    this[key] = value;
    return this;
  }

  update(layerSpec) {
    Object.keys(layerSpec).forEach(k => {
      this.set(k, layerSpec[k]);
    });
  }
}

export default LayerModel;
