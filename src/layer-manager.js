import Promise from 'bluebird';
import LayerModel from './layer-model';

class LayerManager {
  constructor(map, Plugin) {
    this.map = map;
    this.plugin = new Plugin(this.map);
    this.layers = [];
    this.promises = {};
  }

  /**
   * Render layers
   */
  renderLayers() {
    if (this.layers.length > 0) {
      this.layers.map(layerModel => {
        const {
          provider,
          hasChanged,
          changedAttributes,
          decodeParams
        } = layerModel;
        const { sqlParams, params } = changedAttributes;
        const haschanged = (sqlParams || params) && !decodeParams;

        // If layer exists let's update it
        if (layerModel.mapLayer && !haschanged) {
          this.update(layerModel);

          this.promises[layerModel.id] = new Promise(
            resolve => resolve(this.layers)
          );

          return false;
        }

        if (layerModel.mapLayer && hasChanged) {
          this.update(layerModel);
        }

        // If promises exists and it's pending let's cancel it
        if (
          this.promises[layerModel.id] &&
            this.promises[layerModel.id].isPending()
        ) {
          this.promises[layerModel.id].cancel();
        }

        // If there is no method for it let's cancel it
        const method = this.plugin.getLayerByProvider(provider);
        if (!method) {
          this.promises[layerModel.id] = new Promise(
            (resolve, reject) =>
              reject(new Error(`${provider} provider is not yet supported.`))
          );

          return false;
        }

        // If there is method for it let's call it
        this.promises[layerModel.id] = method
          .call(this, layerModel)
          .then(layer => {
            layerModel.set('mapLayer', layer);

            this.plugin.add(layerModel);
            this.plugin.setZIndex(layerModel, layerModel.zIndex);
            this.plugin.setOpacity(layerModel, layerModel.opacity);
            this.plugin.setVisibility(layerModel, layerModel.visibility);

            layerModel.set('haschanged', false);

            this.setEvents(layerModel);
          });

        return false;
      });

      return Promise.all(Object.values(this.promises)).finally(() => {
        this.promises = {};
      });
    }

    // By default it will return a empty layers
    return new Promise(resolve => resolve(this.layers));
  }

  /**
   * Add layers
   * @param {Array} layers
   * @param {Object} layerOptions
   */
  add(
    layers,
    layerOptions = {
      opacity: 1,
      visibility: true,
      zIndex: 0,
      interactivity: null
    }
  ) {
    if (typeof layers === 'undefined') {
      console.error('layers is required');
      return this;
    }

    if (!Array.isArray(layers)) {
      console.error('layers should be an array');
      return this;
    }

    layers.forEach(layer => {
      const layerModel = this.layers.find(l => l.id === layer.id);
      const nextModel = { ...layer, ...layerOptions };

      if (layerModel) {
        layerModel.update(nextModel);
      } else {
        this.layers.push(new LayerModel(nextModel));
      }
    });

    // Returnning a promise
    return this.renderLayers();
  }

  /**
   * Updating a specific layer
   * @param  {Object} layerModel
   */
  update(layerModel) {
    const {
      opacity,
      visibility,
      zIndex,
      params,
      sqlParams,
      decodeParams,
      layerConfig
    } = layerModel.changedAttributes;

    if (typeof opacity !== 'undefined')
      this.plugin.setOpacity(layerModel, opacity);
    if (typeof visibility !== 'undefined')
      this.plugin.setOpacity(layerModel, !visibility ? 0 : layerModel.opacity);
    if (typeof zIndex !== 'undefined')
      this.plugin.setZIndex(layerModel, zIndex);
    if (typeof layerConfig !== 'undefined') {
      this.plugin.setLayerConfig(layerModel, layerConfig);
    }

    if (params && !layerModel.decodeParams) this.plugin.setParams(layerModel);
    if (sqlParams && !layerModel.decodeParams)
      this.plugin.setParams(layerModel);
    if (
      params && layerModel.decodeParams ||
        sqlParams && layerModel.decodeParams ||
        decodeParams
    )
      this.plugin.setDecodeParams(layerModel);
  }

  /**
   * Remove a layer giving a Layer ID
   * @param {Array} layerIds
   */
  remove(layerIds) {
    const layers = this.layers.slice(0);
    const ids = Array.isArray(layerIds) ? layerIds : [ layerIds ];

    this.layers.forEach((layerModel, index) => {
      if (ids) {
        if (ids.includes(layerModel.id)) {
          this.plugin.remove(layerModel);
          layers.splice(index, 1);
        }
      } else {
        this.plugin.remove(layerModel);
      }
    });

    this.layers = ids ? layers : [];
  }

  /**
   * A namespace to set opacity on selected layer
   * @param {Array} layerIds
   * @param {Number} opacity
   */
  setOpacity(layerIds, opacity) {
    const layerModels = this.layers.filter(l => layerIds.includes(l.id));

    if (layerModels.length) {
      layerModels.forEach(lm => {
        this.plugin.setOpacity(lm, opacity);
      });
    } else {
      console.error("Can't find the layer");
    }
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Array} layerIds
   * @param {Boolean} visibility
   */
  setVisibility(layerIds, visibility) {
    const layerModels = this.layers.filter(l => layerIds.includes(l.id));

    if (layerModels.length) {
      layerModels.forEach(lm => {
        this.plugin.setVisibility(lm, visibility);
      });
    } else {
      console.error("Can't find the layer");
    }
  }

  /**
   * A namespace to set z-index on selected layer
   * @param {Array} layerIds
   * @param {Number} zIndex
   */
  setZIndex(layerIds, zIndex) {
    const layerModels = this.layers.filter(l => layerIds.includes(l.id));

    if (layerModels.length) {
      layerModels.forEach(lm => {
        this.plugin.setZIndex(lm, zIndex);
      });
    } else {
      console.error("Can't find the layer");
    }
  }

  /**
   * A namespace to set events on selected layer
   * @param  {Object} layerModel
   */
  setEvents(layerModel) {
    const { events } = layerModel;

    if (events) {
      // Let's leave the managment of event to the plugin
      this.plugin.setEvents(layerModel);
    }
  }
}

export default LayerManager;
