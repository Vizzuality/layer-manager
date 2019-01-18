import UTFGridLayer from './utf-grid-layer-leaflet';

const { L } = typeof window !== 'undefined' ? window : {};

const NEXGDDPLayer = layerModel => {
  const { id, layerConfig, interactivity } = layerModel;
  const { period } = layerConfig;
  const year = (period || {}).value || '1971-01-01';
  const dateString = new Date(year).toISOString();
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/nexgddp/{z}/{x}/{y}?year=${dateString}`;

  let layer = L.tileLayer(tileUrl, layerConfig.body);

  // Add interactivity
  if (interactivity) {
    const interactiveLayer = new UTFGridLayer();

    const LayerGroup = L.LayerGroup.extend({
      group: true,
      setOpacity: opacity => {
        layerModel.mapLayer.getLayers().forEach(l => {
          l.setOpacity(opacity);
        });
      }
    });

    layer = new LayerGroup([layer, interactiveLayer]);
  }

  return Promise.resolve(layer);
};

export default NEXGDDPLayer;
