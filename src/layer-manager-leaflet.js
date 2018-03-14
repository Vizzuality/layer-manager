import LayerManager from './layer-manager';
import { getLayerByProvider } from './layers/layers-leaflet';
import LayerModel from './layer-model';

class LayerManagerLeaflet extends LayerManager {
  addLayers() {
    this.layers.forEach((l) => {
      const method = getLayerByProvider(l.provider);
      if (method) return method.call(this, l);
    });
  }

  remove() {}

  setBounds() {}

  setZIndex(zIndex) {
    if (this.layer) this.layer.setZIndex(zIndex);
  }

  setOpacity(layerId, opacity) {
    if (this instanceof LayerModel) {
      this.setOpacity(layer.opacity);
    }
    return this;
  }

  setVisibility(visibility) {
    if (this.layer) this.setOpacity(visibility ? 1 : 0);
  }

  setInteractivity() {}
}

export default LayerManagerLeaflet;
