class LayerModel {
  static defaults = {
    opacity: 1,
    visibility: true
  }

  constructor(layerSpec) {
    const model = { ...LayerModel.defaults, ...layerSpec };

    Object.keys(model).forEach((k) => {
      this.set(k, model[k]);
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
    const model = { ...LayerModel.defaults, ...layerSpec };

    Object.keys(model).forEach((k) => {
      this.set(k, model[k]);
    });
  }
}

export default LayerModel;
