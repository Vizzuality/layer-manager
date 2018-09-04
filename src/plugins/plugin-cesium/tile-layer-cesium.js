import Promise from 'bluebird';

export default Cesium => layerModel => Promise.resolve().then(() => {
  const { layerConfig = {} } = layerModel;
  const { url } = layerConfig.body;
  const provider = new Cesium.UrlTemplateImageryProvider({ url });
  provider.errorEvent.addEventListener(() => false);
  // don't show warnings
  return new Cesium.ImageryLayer(provider);
});

