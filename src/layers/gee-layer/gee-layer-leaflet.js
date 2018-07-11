const GEELayer = (layerModel) => {
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${layerModel.id}/tile/gee/{z}/{x}/{y}`;
  const layer = L.tileLayer(tileUrl, layerModel.get('body'));

  return new Promise((resolve) => {
    resolve(layer);
  });
};

export default GEELayer;
