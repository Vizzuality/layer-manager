import LayerManager from './layer-manager';
import leafletLayers from './layers/layers-leaflet';

class LayerManagerLeaflet extends LayerManager {
  addLayers() {
    // const method = {
    //   // legacy/deprecated
    //   // leaflet: getLeafletLayer,
    //   // arcgis: getEsriLayer,

    //   // carto
    //   cartodb: leafletLayers.cartoLayer,
    //   carto: leafletLayers.cartoLayer,

    //   // wms
    //   // wmsservice: getLeafletLayer,
    //   // wms: getLeafletLayer,

    //   // arcgis
    //   // featureservice: getEsriLayer,
    //   // mapservice: getEsriLayer,
    //   // tileservice: getEsriLayer,
    //   // esrifeatureservice: getEsriLayer,
    //   // esrimapservice: getEsriLayer,
    //   // esritileservice: getEsriLayer,

    //   // GEE
    //   // gee: getGeeLayer,

    //   // NexGDDP
    //   // nexgddp: getNexGDDPLayer
    // }[this.layerSpec.provider];

    // if (method) {
    //   return method.call(this, this.layerSpec);
    // }

    // return new Promise((resolve, reject) => reject(`${layerSpec.provider} provider is not yet supported.`));
  }

  setZIndex(zIndex) {
    if (this.layer) this.layer.setZIndex(zIndex);
  }

  setOpacity(opacity) {
    this.layer.setOpacity(opacity);
  }

  setVisibility(visibility) {
    if (this.layer) this.setOpacity(visibility ? 1 : 0);
  }
}

export default LayerManagerLeaflet;
