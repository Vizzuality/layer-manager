import LayerManager from './layer-manager';
import gmapsLayers from './layers/layers-gmaps';

class LayerManagerGmaps extends LayerManager {
  createLayer() {
    const method = {
      // legacy/deprecated
      // leaflet: getLeafletLayer,
      // arcgis: getEsriLayer,

      // carto
      cartodb: gmapsLayers.cartoLayer,
      carto: gmapsLayers.cartoLayer

      // wms
      // wmsservice: getLeafletLayer,
      // wms: getLeafletLayer,

      // arcgis
      // featureservice: getEsriLayer,
      // mapservice: getEsriLayer,
      // tileservice: getEsriLayer,
      // esrifeatureservice: getEsriLayer,
      // esrimapservice: getEsriLayer,
      // esritileservice: getEsriLayer,

      // GEE
      // gee: getGeeLayer,

      // NexGDDP
      // nexgddp: getNexGDDPLayer
    }[layerSpec.provider];

    if (method) return method.call(this, this.layerSpec);

    return new Promise((resolve, reject) => reject(`${layerSpec.provider} provider is not yet supported.`));
  }

  setZIndex(zIndex) {
  }

  setOpacity(opacity) {
  }

  setVisibility(visibility) {
  }
}

export default LayerManagerGmaps;
