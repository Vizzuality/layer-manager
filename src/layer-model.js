/* eslint no-param-reassign: 0 */
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

  setParams(params) {
    this.set('params', params);
    return this;
  }

  setSqlParams(sqlParams) {
    this.set('sqlParams', sqlParams);
    return this;
  }

  setDecodeParams(decodeParams) {
    this.set('decodeParams', decodeParams);
    return this;
  }

  setDecodeFunction(decodeFunction) {
    this.set('decodeFunction', decodeFunction);
    return this;
  }

  update(layerSpec) {
    const {
      opacity,
      visibility,
      zIndex,
      params,
      sqlParams,
      decodeParams,
      decodeFunction
    } = layerSpec;

    if (typeof opacity !== 'undefined') this.setOpacity(opacity);
    if (typeof visibility !== 'undefined') this.setVisibility(visibility);
    if (typeof zIndex !== 'undefined') this.setZIndex(zIndex);

    // Decode layer implementation
    if (typeof params !== 'undefined') this.setParams(params);
    if (typeof sqlParams !== 'undefined') this.setSqlParams(sqlParams);
    if (typeof decodeParams !== 'undefined') this.setDecodeParams(decodeParams);
    if (typeof decodeFunction !== 'undefined') this.setDecodeFunction(decodeFunction);
  }
}

export default LayerModel;
