const GeoJsonLayer = (layerModel) => {
  const {
    layerConfig,
    id
  } = layerModel;

  const layer = {
    id,
    source: {
      type: 'geojson',
      data: layerConfig.body
    },
    layers: layerConfig.layers || [
      {
        id: `${id}-fill`,
        type: 'fill',
        source: id,
        paint: {
          'fill-color': 'blue'
        }
      },
      {
        id: `${id}-line`,
        type: 'line',
        source: id,
        paint: {
          'line-color': '#000',
          'line-width': 2,
        }
      }
    ]
  };

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('"type" specified in layer spec doesn`t exist'));
    }
  });
};

export default GeoJsonLayer;
