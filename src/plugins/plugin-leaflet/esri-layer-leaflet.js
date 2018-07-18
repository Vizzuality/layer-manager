import Promise from 'bluebird';

const { L } = window;

const esriLayer = (layerModel) => {
  if (!L.esri) throw new Error('To support this layer you should add esri library for Leaflet.');

  // Preparing layerConfig
  const { layerConfig } = layerModel;
  const bodyStringified = JSON.stringify(layerConfig.body || {})
    .replace(/"mosaic-rule":/g, '"mosaicRule":')
    .replace(/"mosaic_rule":/g, '"mosaicRule":')
    .replace(/"use-cors":/g, '"useCors":')
    .replace(/"use_cors":/g, '"useCors":');

  return new Promise((resolve, reject) => {
    if (!L.esri[layerConfig.type]) return reject(new Error('"type" specified in layer spec doesn`t exist'));

    const layerOptions = JSON.parse(bodyStringified);
    layerOptions.pane = 'tilePane';
    layerOptions.useCors = true; // forcing cors
    if (layerOptions.style && layerOptions.style.indexOf('function') >= 0) {
      layerOptions.style = eval(`(${layerOptions.style})`); // eslint-disable-line
    }

    const layer = L.esri[layerConfig.type](layerOptions);

    if (layer) {
      // Little hack to set zIndex at the beginning
      layer.on('load', () => {
        layer.setZIndex(layerModel.zIndex);
      });

      layer.on('requesterror', err => console.error(err));
    } else {
      return reject();
    }

    if (!layer.setZIndex) {
      layer.setZIndex = (zIndex) => {
        if (layer._currentImage) {
          layer._currentImage._image.style.zIndex = zIndex;
        }
      };
    }

    return resolve(layer);
  });
};

export default esriLayer;
