import isEmpty from 'lodash/isEmpty';
import Promise from 'utils/promise';

import LayerModel from './layer-model';

function checkPluginProperties(plugin) {
  if (plugin) {
    const requiredProperties = [
      'add',
      'remove',
      'setVisibility',
      'setOpacity',
      'setZIndex',
      'setLayerConfig',
      'setParams',
      'setDecodeParams',
      'getLayerByProvider'
    ];

    requiredProperties.forEach((property) => {
      if (!plugin[property]) {
        console.error(
          `The ${property} function is required for layer manager plugins`
        );
      }
    });
  }
}

class LayerManager {
  constructor(map, Plugin) {
    this.map = map;
    this.layers = [];
    this.promises = {};
    this.options = {
      getLayers: this.getLayers.bind(this)
    };

    this.plugin = new Plugin(this.map, this.options);
    checkPluginProperties(this.plugin);
  }


  /**
   * Add layers
   * @param {Array} layers
   * @param {Object} layerOptions
   */
  add(
    layer,
    layerOptions = {
      opacity: 1,
      visibility: true,
      zIndex: 0,
      interactivity: null
    }
  ) {
    if (typeof layer === 'undefined') {
      console.error('layer is required');
      return this;
    }

    const layerModel = new LayerModel({ ...layer, ...layerOptions });
    const { id } = layerModel;

    if (this.layers.find(l => l.id === id)) return this.layers;
    this.layers.push(layerModel);

    this.requestLayer(layerModel);

    return this.layers;
  }

  /**
   * Updating a specific layer
   * @param  {Object} layerModel
   */
  update(id, changedProps) {
    const layerModel = this.getLayerModel(id);
    if (!layerModel) return;

    layerModel.update(changedProps);

    const {
      opacity,
      visibility,
      zIndex,
      decodeParams
    } = changedProps;

    if (typeof opacity !== 'undefined') {
      this.plugin.setOpacity(layerModel, opacity);
    }
    if (typeof visibility !== 'undefined') {
      this.plugin.setOpacity(layerModel, !visibility ? 0 : layerModel.opacity);
    }
    if (typeof zIndex !== 'undefined') {
      this.plugin.setZIndex(layerModel, zIndex);
    }

    if (!isEmpty(decodeParams)) this.plugin.setDecodeParams(layerModel);
  }

  /**
   * Remove a layer giving a Layer ID
   * @param {String} id
   */
  remove(id) {
    const layers = this.layers.slice(0);

    this.requestCancel(id);

    const layerModel = this.getLayerModel(id);
    this.plugin.remove(layerModel);

    this.layers = layers.filter(l => l.id !== id);
  }

  getLayers() {
    return this.layers;
  }

  getLayerModel(id) {
    return this.layers.find(l => l.id === id);
  }

  /**
   * A namespace to set opacity on selected layer
   * @param {String} id
   * @param {Number} opacity
   */
  setOpacity(id, opacity) {
    const layerModel = this.getLayerModel(id);
    this.plugin.setOpacity(layerModel, opacity);
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {String} id
   * @param {Boolean} visibility
   */
  setVisibility(id, visibility) {
    const layerModel = this.getLayerModel(id);
    this.plugin.setVisibility(layerModel, visibility);
  }

  /**
   * A namespace to set z-index on selected layer
   * @param {String} id
   * @param {Number} zIndex
   */
  setZIndex(id, zIndex) {
    const layerModel = this.getLayerModel(id);
    this.plugin.setZIndex(layerModel, zIndex);
  }

  requestLayer(layerModel) {
    const { provider } = layerModel;
    const method = this.plugin.getLayerByProvider(provider, layerModel);

    if (!method) {
      this.promises[layerModel.id] = Promise.reject(new Error(`${provider} provider is not yet supported.`));
      return false;
    }

    // Cancel previous/existing request
    this.requestCancel(layerModel.id);

    // every render method returns a promise that we store in the array
    // to control when all layers are fetched.
    this.promises[layerModel.id] = method.call(this, layerModel).then((layer) => {
      const { _canceled: canceled } = this.promises[layerModel.id];

      if (!canceled) {
        layerModel.set('mapLayer', layer);

        this.plugin.add(layerModel, this.layers);
        this.plugin.setZIndex(layerModel, layerModel.zIndex);
        this.plugin.setOpacity(layerModel, layerModel.opacity);
        this.plugin.setVisibility(layerModel, layerModel.visibility);
      }
    });

    return this;
  }

  requestCancel(layerModelId) {
    // Cancel previous/existing request
    if (
      this.promises[layerModelId]
      && this.promises[layerModelId].cancel
    ) {
      this.promises[layerModelId].cancel();
    }
  }
}

export default LayerManager;
