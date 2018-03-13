import LayerManager from './layer-manager';
import { getLayerByProvider } from './layers/layers-leaflet';

class LayerManagerLeaflet extends LayerManager {
  addLayers() {
    layerSpec.forEach((l) => {
      const method = getLayerByProvider(l.provider);
      if (method) return method.call(this, this.layers);
    });
  }

  remove() {}

  setBounds() {}

  setZIndex(zIndex) {
    if (this.layer) this.layer.setZIndex(zIndex);
  }

  setOpacity(opacity) {
    this.layer.setOpacity(opacity);
  }

  setVisibility(visibility) {
    if (this.layer) this.setOpacity(visibility ? 1 : 0);
  }

  setInteractivity() {}
}

export default LayerManagerLeaflet;
