import Promise from 'bluebird';

import UTFGridLayer from './utf-grid-layer-leaflet';

const { L } = typeof window !== 'undefined' ? window : {};

const maxBounds = L &&
  new L.LatLngBounds(
    new L.LatLng(49.496674527470455, -66.357421875),
    new L.LatLng(24.607069137709683, -131.66015625)
  );

const LOCALayer = layerModel => {
  const { id, layerConfig, interactivity } = layerModel;
  const { period } = layerConfig;
  const year = (period || {}).value || '1971';
  const dateString = new Date(year).toISOString();
  const tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/loca/{z}/{x}/{y}?year=${dateString}`;

  let layer = L.tileLayer(tileUrl, {
    ...layerConfig.body,
    minNativeZoom: 4,
    bounds: maxBounds
  });

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

    layer = new LayerGroup([ layer, interactiveLayer ]);
  }

  return new Promise(resolve => {
    resolve(layer);
  });
};

export default LOCALayer;
