import Promise from 'bluebird';

const LOCALayer = (layerModel) => {
  const { id, body, period } = layerModel;
  const year = (period || {}).value || '1971';
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/loca/{z}/{x}/{y}?year=${year}`;

  const layer = L.tileLayer(tileUrl, body);

  return new Promise((resolve) => {
    resolve(layer);
  });
};

export default LOCALayer;
