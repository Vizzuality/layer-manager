import isEqual from 'lodash/isEqual';

// decodes
import canvasDecodes from './canvas-decodes';

class LayerModel {
  opacity = 1;

  visibility = true;

  constructor(layerSpec = {}) {
    // parse params before setting model's properties
    Object.assign(this, {
      ...layerSpec,
      ...{
        ...LayerModel.parse(layerSpec),
        // compatibility
        ...layerSpec.params && { params: layerSpec.params },
        ...layerSpec.sqlParams && { sqlParams: layerSpec.sqlParams },
        ...layerSpec.decodeParams && { decodeParams: layerSpec.decodeParams },
        ...canvasDecodes[layerSpec.id] && { decodeFunction: canvasDecodes[layerSpec.id] }
      }
    }, { changedAttributes: {} });

    // if the model has decodeParams but there's no decoder available, will show a warning.
    if (Object.prototype.hasOwnProperty.call(this, 'decodeParams') && !this.decodeFunction) {
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
    const nextData = {
      ...layerSpec
    };

    // reseting changedAttributes for every update
    this.set('changedAttributes', {});

    Object.keys(nextData).forEach(k => {
      if (!isEqual(prevData[k], nextData[k])) {
        this.changedAttributes[k] = nextData[k];
        this.set(k, nextData[k]);
      }
    });
  }

  static parse(layerSpec = {}) {
    const {
      params_config: paramsConfig,
      sqlParams_config: sqlParamsConfig,
      decode_config: decodeConfig,
      body
    } = layerSpec.layerConfig;
    const { url } = body;
    let params = (paramsConfig || []).reduce((acc, v) => ({ ...acc, ...{ [v.key]: v.default }}), {});
    const sqlParams = (sqlParamsConfig || []).reduce((acc, v) => ({ ...acc, ...{ [v.key]: v.default }}), {});
    const decodeParams = (decodeConfig || []).reduce((acc, v) => ({ ...acc, ...{ [v.key]: v.default }}), {});

    params = {
      ...params,
      ...url && { url }
    };

    return {
      ...Object.keys(params) && { params },
      ...Object.keys(sqlParams).length && { sqlParams },
      ...Object.keys(decodeParams).length && { decodeParams }
    };
  }
}

export default LayerModel;
