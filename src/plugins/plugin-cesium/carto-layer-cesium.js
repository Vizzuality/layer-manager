import cartoService from '../../services/carto-layer-service';

export default Cesium => layerModel => cartoService(layerModel)
  .then((response) => {
    const { layerConfig } = layerModel;
    const url = `${response.cdn_url.templates.https.url}/${layerConfig.account}/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;
    const provider = new Cesium.UrlTemplateImageryProvider({ url });
    provider.errorEvent.addEventListener(() => false); // don't show warnings
    return new Cesium.ImageryLayer(provider);
  });
