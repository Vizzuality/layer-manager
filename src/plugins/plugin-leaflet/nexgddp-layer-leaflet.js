import Promise from 'bluebird';

const { L } = typeof window !== 'undefined' ? window : {};

const NEXGDDPLayer = (layerModel) => {
  const { id, layerConfig } = layerModel;
  const { period } = layerConfig;
  const year = (period || {}).value || '1971-01-01';
  const dateString = new Date(year).toISOString();
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/nexgddp/{z}/{x}/{y}?year=${dateString}`;

  const layer = L.tileLayer(tileUrl, layerConfig.body);

  return new Promise((resolve) => {
    resolve(layer);
  });
};

export default NEXGDDPLayer;
