import { CancelablePromise } from 'cancelable-promise';
import { isEmpty } from '@vizzuality/layer-manager-utils';
import LayerModel from './layer-model';

import type { LayerSpec, ProviderMaker, Plugin } from '../types';

const defaultLayerOptions: Partial<LayerSpec> = {
  opacity: 1,
  visibility: true,
  zIndex: 0,
};

class LayerManager {
  private _layers: LayerModel[] = [];

  private _plugin: Plugin;

  private _promises: Record<LayerSpec['id'], any> = {};

  static providers: Record<ProviderMaker['name'], ProviderMaker['handleData']> = {};

  constructor(plugin: Plugin) {
    this._plugin = plugin;
    this._plugin.setOptions({ getLayers: this.getLayers.bind(this) });
  }

  /**
   * Add new layer
   * @param {Array} layers
   * @param {Object} layerOptions
   * @param {Function} onAfterAdd
   */
  add(
    layer: LayerSpec,
    layerOptions: Partial<LayerSpec> = defaultLayerOptions,
    onAfterAdd: (layerModel: LayerModel) => void,
  ): LayerModel[] {
    if (!layer) throw new Error('layer param is required');

    const layerModel = new LayerModel({ ...layer, ...layerOptions });
    const layerWasAlreadyAdded = this._layers.find(({ id }) => id === layerModel.id);

    // Only add a new layer if it was not added before
    if (!layerWasAlreadyAdded) {
      this._layers.push(layerModel);
    }

    this.requestLayer(layerModel, onAfterAdd); // TO-DO: review

    return this._layers;
  }

  /**
   * Updating a specific layer by ID
   * @param {String} id
   * @param {Object} newLayerSpec
   */
  update(id: LayerSpec['id'], newLayerSpec: Partial<LayerSpec>): void {
    const layerModel = this.getLayerModel(id);
    if (!layerModel || !layerModel.mapLayer) return;

    layerModel.update(newLayerSpec);

    const {
      opacity,
      visibility,
      zIndex,
      source,
      render,
      params,
      sqlParams,
      decodeParams,
    } = newLayerSpec;

    if (typeof opacity !== 'undefined') {
      this._plugin.setOpacity(layerModel, opacity);
    }

    if (typeof visibility !== 'undefined') {
      this._plugin.setVisibility(layerModel, visibility);
    }

    if (typeof zIndex !== 'undefined') {
      this._plugin.setZIndex(layerModel, zIndex);
    }

    if (!isEmpty(source)) {
      this._plugin.setSource(layerModel);
    }

    if (!isEmpty(render)) {
      this._plugin.setRender(layerModel);
    }

    if (!isEmpty(params)) {
      this._plugin.setParams(layerModel);
    }

    if (!isEmpty(sqlParams)) {
      this._plugin.setSQLParams(layerModel);
    }

    if (!isEmpty(decodeParams)) {
      this._plugin.setDecodeParams(layerModel);
    }
  }

  /**
   * Remove a layer giving a Layer ID
   * @param {String} id
   * @param {Function} onAfterRemove
   */
  remove(id: LayerSpec['id'], onAfterRemove: (layerModel: LayerModel) => void): void {
    const layers = this._layers.slice(0);

    this.requestCancel(id);

    const layerModel = this.getLayerModel(id);

    if (layerModel) {
      this._plugin.remove(layerModel);
      onAfterRemove(layerModel);
    }

    this._layers = layers.filter((l) => l.id !== id);
  }

  /**
   * Same as layers getter
   * NOTE: This method will be DEPRECATED
   * @returns []
   */
  public getLayers(): LayerModel[] {
    return this._layers;
  }

  public getLayerModel(id: LayerSpec['id']): LayerModel | undefined {
    return this._layers.find((layerModel) => layerModel.id === id);
  }

  /**
   * A namespace to set opacity on selected layer
   * @param {String} id
   * @param {Number} opacity
   */
  setOpacity(id: LayerSpec['id'], opacity: number): void {
    const layerModel = this.getLayerModel(id);
    if (layerModel) this._plugin.setOpacity(layerModel, opacity);
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {String} id
   * @param {Boolean} visibility
   */
  setVisibility(id: LayerSpec['id'], visibility: boolean): void {
    const layerModel = this.getLayerModel(id);
    if (layerModel) this._plugin.setVisibility(layerModel, visibility);
  }

  /**
   * A namespace to set z-index on selected layer
   * @param {String} id
   * @param {Number} zIndex
   */
  setZIndex(id: LayerSpec['id'], zIndex: number): void {
    const layerModel = this.getLayerModel(id);
    if (layerModel) this._plugin.setZIndex(layerModel, zIndex);
  }

  requestLayer(layerModel: LayerModel, onAfterAdd: (_layerModel: LayerModel) => void): void {
    const { id, type } = layerModel;
    const method = this._plugin.getLayerByType(type);

    if (!method) {
      this._promises[id] = CancelablePromise.reject(
        new Error(`${type} type is not yet supported.`),
      );
    } else {
      // Cancel previous/existing request
      this.requestCancel(layerModel.id);

      // every request method returns a promise that we store in the array
      // to control when all layers are fetched.
      this._promises[layerModel.id] = method
        .call(this, layerModel, LayerManager.providers)
        .then((layer: unknown) => {
          const { isCanceled } = this._promises[layerModel.id];
          if (!isCanceled()) {
            layerModel.setMapLayer(layer);

            this._plugin.add(layerModel, this._layers);

            if (layerModel.zIndex || layerModel.zIndex === 0) {
              this._plugin.setZIndex(layerModel, layerModel.zIndex);
            }
            if (layerModel.opacity || layerModel.opacity === 0) {
              this._plugin.setOpacity(layerModel, layerModel.opacity);
            }
            if (layerModel.visibility) {
              this._plugin.setVisibility(layerModel, layerModel.visibility);
            }

            this._plugin.setRender(layerModel);

            onAfterAdd(layerModel);
          }
        });
    }
  }

  /**
   * Cancel previous/existing request
   */
  requestCancel(id: LayerSpec['id']): void {
    if (this._promises[id]) {
      this._promises[id].cancel();
    }
  }

  /**
   * Util for React component.
   * NOTE: This method will be DEPRECATED
   */
  unmount(): void {
    this._plugin.map = null;
    this._plugin.unmount();
  }

  /**
   * Access to map instance, provided by the plugin.
   * NOTE: This method will be DEPRECATED
   */
  public get map(): Plugin['map'] {
    return this._plugin.map;
  }

  /**
   * Access to layer collection instances
   */
  public get layers(): LayerModel[] {
    return this._layers;
  }

  /**
   * Method to register a new provider
   * @param provider Instance of ProviderMaker
   */
  public static registerProvider(provider: ProviderMaker): void {
    LayerManager.providers = {
      ...LayerManager.providers,
      [provider.name]: provider.handleData,
    };
  }
}

export default LayerManager;
