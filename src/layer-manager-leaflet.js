import LayerManager from './layer-manager';
import { getLayerByProvider } from './layers/layers-leaflet';
import LayerModel from './layer-model';

class LayerManagerLeaflet extends LayerManager {
  addLayers() {
    if (this.layers.length > 0) {
      const promises = this.layers.map((l) => {
        const method = getLayerByProvider(l.provider);
        if (!method) {
          return new Promise((resolve, reject) =>
            reject(new Error(`${l.provider} provider is not yet supported.`)));
        }
        return method.call(this, l).then(layer => l.set('mapLayer', layer));
      });
      return Promise.all(promises);
    }

    // By default it will return a empty layers
    return new Promise(resolve => resolve(this.layers));
  }

  /**
   * A namespace to set opacity on selected layer previously with find method
   * @param {String} opacity
   */
  setOpacity(opacity) {
    const layerModel = this;
    if (layerModel instanceof LayerModel && layerModel.get('mapLayer')) {
      layerModel.get('mapLayer').setOpacity(opacity);
    }
    return this;
  }

  /**
   * A namespace to hide or show a selected layer previously with find method
   * @param {String} visibility
   */
  setVisibility(visibility) {
    const layerModel = this;
    if (layerModel instanceof LayerModel && layerModel.get('mapLayer')) {
      layerModel.get('mapLayer').setOpacity(visibility ? 1 : 0);
    }
  }

  /**
   * A namespace to set z-index on selected layer previously with find method
   * @param {String} zIndex
   */
  setZIndex(zIndex) {
    const layerModel = this;
    if (layerModel instanceof LayerModel && layerModel.get('mapLayer')) {
      layerModel.get('mapLayer').setZIndex(zIndex);
    }
  }
}

export default LayerManagerLeaflet;
