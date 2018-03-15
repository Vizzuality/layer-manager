import cartoService from './carto-layer-service';

const CartoLayer = (layerSpec) => {
  const { layerConfig } = layerSpec;

  return new Promise((resolve, reject) => {
    cartoService(layerSpec)
      .then((response) => {
        const tileUrl = `${response.cdn_url.templates.https.url}/${layerConfig.account}/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;
        const layer = L.tileLayer(tileUrl, {
          minZoom: 1,
          maxZoom: 20
        });

        resolve(layer);
      })
      .catch(err => reject(err));
  });
};

export default CartoLayer;
