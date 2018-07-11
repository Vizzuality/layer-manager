import Promise from 'bluebird';

const GEELayer = (layerModel) => {
  const { id, body } = layerModel;
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;

  const layer = L.tileLayer(tileUrl, body);

  return new Promise((resolve) => {
    resolve(layer);
  });
};

export default GEELayer;
