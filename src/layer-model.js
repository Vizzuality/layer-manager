/* eslint no-param-reassign: 0 */
class LayerModel {
  DEFAULTS = {
    opacity: 1,
    visibility: true
  }

  constructor(layerSpec) {
    const model = { ...this.DEFAULTS, ...layerSpec };

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
    const model = { ...this.DEFAULTS, ...layerSpec };

    Object.keys(model).forEach((k) => {
      this.set(k, model[k]);
    });
  }
}

export default LayerModel;
