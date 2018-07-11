import Promise from 'bluebird';

const maxBounds = new L.LatLngBounds(
  new L.LatLng(49.496674527470455, -66.357421875),
  new L.LatLng(24.607069137709683, -131.66015625)
);

const LOCALayer = (layerModel) => {
  const { id, layerConfig } = layerModel;
  const year = (layerConfig.period || {}).value || '1971';
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/loca/{z}/{x}/{y}?year=${year}`;

  const layer = L.tileLayer(tileUrl, {
    ...layerConfig.body,
    minNativeZoom: 4,
    bounds: maxBounds
  });

  return new Promise((resolve) => {
    resolve(layer);
  });
};

export default LOCALayer;
