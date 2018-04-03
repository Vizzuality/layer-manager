import cartoService from './carto-layer-service';

const CartoLayer = (layerModel) => {
  const layerConfig = layerModel.get('layerConfig');

  return new Promise((resolve, reject) => {
    cartoService(layerModel)
      .then((response) => {
        const tileUrl = `${response.cdn_url.templates.https.url}/${layerConfig.account}/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;
        const layer = L.tileLayer(tileUrl);

        resolve(layer);
      })
      .catch(err => reject(err));
  });
};

export default CartoLayer;
