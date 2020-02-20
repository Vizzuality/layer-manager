import isEqual from 'lodash/isEqual';

class LayerModel {
  opacity = 1;

  visibility = true;

  source = {};

  render = {};

  constructor(layerSpec = {}) {
    Object.assign(this, layerSpec, { changedAttributes: {} });
  }

  get(key) {
    return this[key];
  }

  set(key, value) {
    this[key] = value;
    return this;
  }

  update(layerSpec) {
    const prevData = { ...this };
    const nextData = { ...layerSpec };

    // reseting changedAttributes for every update
    this.set('changedAttributes', {});

    Object.keys(nextData).forEach(k => {
      if (!isEqual(prevData[k], nextData[k])) {
        this.changedAttributes[k] = nextData[k];
        this.set(k, nextData[k]);
      }
    });
  }
}

export default LayerModel;
