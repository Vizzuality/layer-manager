import cartoLayer from './carto-layer/carto-layer-leaflet';
import esriLayer from './esri-layer/esri-layer-leaflet';

const method = {
  // carto
  cartodb: cartoLayer,
  carto: cartoLayer,

  // ESRI
  arcgis: esriLayer,
  featureservice: esriLayer,
  mapservice: esriLayer,
  tileservice: esriLayer,
  esrifeatureservice: esriLayer,
  esrimapservice: esriLayer,
  esritileservice: esriLayer
};

export default { cartoLayer, esriLayer };

export function getLayerByProvider(provider) {
  return method[provider];
}
