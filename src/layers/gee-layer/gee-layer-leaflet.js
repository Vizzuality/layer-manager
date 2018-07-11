const GEELayer = (layerModel) => {
  const body = layerModel.get('body');
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${layerModel.id}/tile/gee/{z}/{x}/{y}`;
  console.log(layerModel, body)
  const layer = L.tileLayer(tileUrl, layerModel.get('body'));

  return new Promise((resolve) => {
    resolve(layer);
  });
};

export default GEELayer;
