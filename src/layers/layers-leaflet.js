import cartoLayer from './carto-layer/carto-layer-leaflet';

const method = {
  // carto
  cartodb: cartoLayer,
  carto: cartoLayer
};

export default { cartoLayer };

export function getLayerByProvider(provider) {
  return method[provider];
}
