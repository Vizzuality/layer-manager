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
        // adds decodeFunction if the layerSpec contains decode_config params (it is a canvas layer)
        ...Object.prototype.hasOwnProperty.call(layerSpec.layerConfig, 'decode_config') &&
          { decodeFunction: canvasDecodes[layerSpec.id] }
      }
    }, { changedAttributes: {} });
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
    let params = {};
    const sqlParams = {};
    const decodeParams = {};

    (paramsConfig || []).forEach(_param => {
      if (_param.key && _param.default) params[_param.key] = _param.default;
    });

    params = {
      ...params,
      url
    };

    (sqlParamsConfig || []).forEach(_param => {
      if (_param.key && _param.default) sqlParams[_param.key] = _param.default;
    });

    (decodeConfig || []).forEach(_param => {
      if (_param.key && _param.default) decodeParams[_param.key] = _param.default;
    });

    return {
      params,
      sqlParams,
      decodeParams
    };
  }
}

export default LayerModel;
