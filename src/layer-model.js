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
    Object.keys(layerSpec).forEach((k) => {
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

  setMapLayer(layer) {
    this.mapLayer = layer;
    return this;
  }

  setInteractiveMapLayer(layer) {
    this.interactiveMapLayer = layer;
    return this;
  }

  setLayerRequest(request) {
    this.layerRequest = request;
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

  setDecode(decode) {
    this.set('decode', decode);
    return this;
  }

  update(layerSpec) {
    const { opacity, visibility, zIndex, decode } = layerSpec;
    if (typeof opacity !== 'undefined') this.setOpacity(opacity);
    if (typeof visibility !== 'undefined') this.setVisibility(visibility);
    if (typeof zIndex !== 'undefined') this.setZIndex(zIndex);
    if (typeof decode !== 'undefined') this.setDecode(decode);
  }
}

export default LayerModel;
