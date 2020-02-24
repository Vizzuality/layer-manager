import Promise from 'utils/promise';

const VideoLayer = layerModel => {
  const { source = {}, render, id } = layerModel;

  const layer = {
    id,
    type: 'raster',
    source: {
      ...source,
      type: 'video-tiled',
      tiles: [
        // "https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/{z}/{x}/{y}.mp4",
        'https://storage.googleapis.com/skydipper_materials/movie-tiles/EVI_TEST/{z}/{x}/{y}.mp4'
      ],
      scheme: 'xyz',
      tileSize: 256,
      minzoom: 1,
      maxzoom: 4,
      playbackRate: 1
    },
    ...render,
    layers: [
      {
        id: `${id}-raster`,
        type: 'raster',
        source: id
      }
    ]
  };

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default VideoLayer;
