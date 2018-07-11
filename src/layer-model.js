/* eslint no-param-reassign: 0 */

const validator = {
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

    if (key === 'visibility') {
      if (typeof value !== 'boolean') {
        throw new TypeError('Visibility must be a boolean');
      }
    }

    if (key === 'zIndex') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new TypeError('Opacity must be a number');
      }
      if (value < 0) {
        throw new TypeError('Opacity must be a positive number');
      }
    }

    // The default behavior to store the value
    target[key] = value;

    return true;
  }
};

class LayerModel {
  constructor(layerSpec) {
    this.layer = new Proxy(Object.assign({}, layerSpec), validator);
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

  get visibility() {
    return this.layer.visibility;
  }

  get zIndex() {
    return this.layer.zIndex;
  }

  get mapLayer() {
    return this.layer.mapLayer;
  }

  get layerConfig() {
    return this.layer.layerConfig;
  }

  get events() {
    return this.layer.events;
  }

  get(key) {
    return this.layer[key];
  }

  set(key, value) {
    if (
      Object.prototype.hasOwnProperty.call(this.layer, key) &&
      this.layer[key] !== value
    ) {
      this.layer[key] = value;
    }
    return this;
  }

  setMapLayer(layer) {
    this.layer.mapLayer = layer;
    return this;
  }

  setInteractiveMapLayer(layer) {
    this.layer.interactiveMapLayer = layer;
    return this;
  }

  setLayerRequest(request) {
    this.layer.layerRequest = request;
    return this;
  }

  setOpacity(opacity) {
    this.set('opacity', opacity);
    return this;
  }

  setZIndex(zIndex) {
    this.set('zIndex', zIndex);
    return this;
  }

  setVisibility(visibility) {
    this.set('visibility', visibility);
    return this;
  }

  setInteractivity(interactivity) {
    this.set('interactivity', interactivity);
    return this;
  }

  update(layerSpec) {
    const { opacity, visibility, zIndex } = layerSpec;
    if (typeof opacity !== 'undefined') this.setOpacity(opacity);
    if (typeof visibility !== 'undefined') this.setVisibility(visibility);
    if (typeof zIndex !== 'undefined') this.setZIndex(zIndex);
  }
}

export default LayerModel;
