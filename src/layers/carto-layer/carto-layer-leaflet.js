import cartoService from './carto-layer-service';

const CartoLayer = (layerSpec) => {
  const { layerConfig, zIndex, visibility, opacity } = layerSpec;

  return new Promise((resolve, reject) => {
    cartoService(layerSpec)
      .then((response) => {
        if (!response.cdn_url) console.log(response, layerSpec.id);
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
