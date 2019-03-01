import { replace } from 'utils/query';
import { MapboxLayer } from '@deck.gl/mapbox';

import TileLayer from './tile-layer';

const getTileData = ({ x, y, z }, url) => {
  const mapSource = url
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  return fetch(mapSource)
    .then(response => response.blob())
    .then((response) => {
      const src = URL.createObjectURL(response);
      const image = new Image();

      image.src = src;
      return image;
    });
};

const DeckLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    decodeParams,
    id
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  const { body, url, minzoom, maxzoom } = layerConfigParsed || {};

  const layer = {
    id,
    layers: [
      new MapboxLayer({
        id,
        type: TileLayer,
        minZoom: minzoom,
        maxZoom: maxzoom,
        getTileData: e => getTileData(e, url || body.url),
        opacity: layerModel.opacity,
        decodeParams
      })
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

export default DeckLayer;
