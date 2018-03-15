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
    this.events = {};
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

  get(key) {
    return this.layer[key];
  }

  set(key, value) {
    if (Object.prototype.hasOwnProperty.call(this.layer, key) &&
      this.layer[key] !== value) {
      this.layer[key] = value;
      this.trigger(`change:${key}`);
      this.trigger('change');
    }
    return this;
  }

  setOpacity(opacity) {
    this.layer.opacity = opacity;
    return this;
  }

  setZIndex(zIndex) {
    this.layer.zIndex = zIndex;
    return this;
  }

  setVisibility(visibility) {
    this.layer.visibility = visibility;
    return this;
  }

  // Event
  on(type, attr, fn) {
    let action = fn;
    if (!action && attr && typeof attr === 'function') action = attr;
    if (!this.events[type]) this.events[type] = [];
    this.events[type].push({
      action,
      type,
      target: this.layer
    });
  }

  off(type, fn) {
    if (Object.prototype.hasOwnProperty.call(this.events, type)) {
      this.events[type].forEach((e, index) => {
        if (e.action === fn) this.events[type].slice(index, 1);
      });
    }
  }

  trigger(type) {
    if (Object.prototype.hasOwnProperty.call(this.events, type)) {
      this.events[type].forEach((e) => {
        e.action(e);
      });
    }
  }
}

export default LayerModel;
