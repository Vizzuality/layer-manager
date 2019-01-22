export default Cesium => layerModel => new Promise((resolve) => {
  const { layerConfig = {} } = layerModel;
  const { url } = layerConfig.body;
  const provider = new Cesium.UrlTemplateImageryProvider({ url });
  provider.errorEvent.addEventListener(() => false);
  // don't show warnings
  resolve(new Cesium.ImageryLayer(provider));
});
