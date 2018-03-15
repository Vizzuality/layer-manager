import LayerManager from './layer-manager';
import { getLayerByProvider } from './layers/layers-gmaps';

class LayerManagerGmaps extends LayerManager {
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

  setZIndex(zIndex) {
    // TODO
    return this;
  }

  setOpacity(opacity) {
    // TODO
    return this;
  }

  setVisibility(visibility) {
    // TODO
    return this;
  }
}

export default LayerManagerGmaps;
