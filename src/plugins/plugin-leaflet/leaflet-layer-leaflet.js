import Promise from 'bluebird';

const { L } = window;

const LeafletLayer = (layerModel) => {
  const { layerConfig } = layerModel;
  let layer;

  // Transforming data layer
  if (layerConfig.body.crs && L.CRS[layerConfig.body.crs]) {
    layerConfig.body.crs = L.CRS[layerConfig.body.crs.replace(':', '')];
    layerConfig.body.pane = 'tilePane';
  }

  switch (layerConfig.type) {
    case 'wms':
      layer = L.tileLayer.wms(layerConfig.url, layerConfig.body);
      break;
    case 'tileLayer':
      if (JSON.stringify(layerConfig.body).indexOf('style: "function') >= 0) {
        layerConfig.body.style = eval(`(${layerConfig.body.style})`);
      }
      layer = L.tileLayer(layerConfig.url, layerConfig.body);
      break;
    default:
      break;
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

export default LeafletLayer;
