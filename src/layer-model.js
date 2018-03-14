var validator = {
  set(target, key, value) {
    if (key === 'opacity') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new TypeError('Opacity must be a number');
      }
      if (value > 1) {
        throw new TypeError('Opacity must be a number between 0 and 1');
      }
      if (value < 0) {
        throw new TypeError('Opacity must be a positive number');
      }
    }
    return true;
  }
};

export default class LayerModel {
  constructor(layerSpec) {
    this.layer = new Proxy(layerSpec, validator);
  }

  get id() {
    return this.layer.id;
  }

  get dataset() {
    return this.layer.dataset;
  }

  get opacity() {
    return this.layer.opacity;
  }

  get(key) {
    if (this.layer.prototype.hasOwnProperty(key)) return this.layer[key];
  }

  setOpacity(opacity) {
    this.layer.opacity = opacity;
    // if (this.layer.mapLayer) this.layer.mapLayer.setOpacity(this.layer.opacity);
  }
}
