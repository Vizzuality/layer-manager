import isEqual from 'lodash/isEqual';

// decodes
import canvasDecodes from './canvas-decodes';


class LayerModel {
  opacity = 1;

  visibility = true;

  constructor(layerSpec = {}) {
    Object.assign(
      this,
      {
        ...layerSpec,
        ...!layerSpec.decodeFunction && canvasDecodes[layerSpec.id] &&
        { decodeFunction: canvasDecodes[layerSpec.id] },
        changedAttributes: {}
      }
    );

    // if the model has decodeParams but there's no decoder available, will show a warning.
    if (Object.prototype.hasOwnProperty.call(this, 'decodeParams') &&
      (!layerSpec.decodeFunction)  && !this.decodeFunction) {
        console.warn(`${layerSpec.id}: canvas decoder not found.`)
      }
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
