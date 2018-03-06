import wriSerializer from 'wri-json-api-serializer';
import LayerManager from './layer-manager';
import leafletLayers from './layers/layers-leaflet';

class LayerManagerLeaflet extends LayerManager {
  /**
   * Add layer
   * @param {Array} layerSpec
   */
  add(layerSpec, layerOptions = { opacity: 1, visibility: true, zIndex: 0 }) {
    let { opacity, visibility, zIndex } = layerOptions;
    const newLayers = wriSerializer(layerSpec);

    if (this.layers.length === 0) {
      // Adding all layers to this.layers
      this.layers = newLayers.map((l) => {
        zIndex += 1;
        return {...l, opacity, visibility, zIndex };
      });
    } else {
      // If layers already exists it checks ID before adding
      newLayers.forEach((l) => {
        const layerWasAdded = this.layers.find((n) => {
          return n.id === l.id;
        });

        if (!layerWasAdded) this.layers.push(newLayer);
      });
    }

    console.log(this.layers);
  }

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
