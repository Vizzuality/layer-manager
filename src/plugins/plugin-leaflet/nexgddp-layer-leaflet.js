import Promise from 'bluebird';

const { L } = window;

const NEXGDDPLayer = layerModel => {
  const { id, layerConfig } = layerModel;
  const year = (layerConfig.period || {}).value || '1971';
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/nexgddp/{z}/{x}/{y}?year=${year}`;

  const layer = L.tileLayer(tileUrl, layerConfig.body);

  return new Promise(resolve => {
    resolve(layer);
  });
};

export default NEXGDDPLayer;
