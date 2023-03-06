import { CancelablePromise } from 'cancelable-promise';

const VideoLayer = (layerModel) => {
  const { source = {}, render, id } = layerModel;

  const layer = {
    id,
    type: 'raster',
    source: {
      ...source,
      type: 'video-tiled',
      // tiles: [ "https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/{z}/{x}/{y}.mp4" ],
      tiles: [
        'https://storage.googleapis.com/skydipper_materials/movie-tiles/EVI_TEST/{z}/{x}/{y}.mp4',
      ],
      scheme: 'xyz',
      tileSize: 256,
      minzoom: 1,
      maxzoom: 4,
      playbackRate: 0.1,
      // geometryFilter: 'https://storage.googleapis.com/deltares-video-map/mapbox-test/test1/geometry-filter.geojson'
    },
    ...render,
    layers: [
      {
        id: `${id}-raster`,
        type: 'raster',
        source: id,
      },
    ],
  };

  return new CancelablePromise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default VideoLayer;
