import Promise from 'utils/promise';

import { replace } from 'utils/query';

const VideoLayer = layerModel => {
  const { source = {}, render = {}, params, sqlParams, id } = layerModel;

  const sourceParsed =
    source.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

  const renderParsed =
    render.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

  const layer = {
    id,
    type: 'raster',
    source: {
      ...sourceParsed,
      type: 'video-tiled',
      // tiles: [ "https://storage.googleapis.com/skydipper_materials/movie-tiles/MODIS/{z}/{x}/{y}.mp4" ],
      tiles: [
        'https://storage.googleapis.com/skydipper_materials/movie-tiles/EVI_TEST/{z}/{x}/{y}.mp4'
      ],
      scheme: 'xyz',
      tileSize: 256,
      minzoom: 1,
      maxzoom: 4,
      playbackRate: 0.1
      // geometryFilter: 'https://storage.googleapis.com/deltares-video-map/mapbox-test/test1/geometry-filter.geojson'
    },
    ...renderParsed,
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
