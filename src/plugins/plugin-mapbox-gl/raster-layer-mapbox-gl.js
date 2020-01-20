import Promise from 'utils/promise';

import { replace } from 'utils/query';
// import { MapboxLayer } from '@deck.gl/mapbox';

import MapboxLayer from './custom-layers/mapbox-layer';
import TileLayer from './custom-layers/tile-layer';
import DecodedLayer from './custom-layers/decoded-layer';

const getTileData = ({ x, y, z }, url) => {
  const mapSource = url
    .replace('{z}', z)
    .replace('{x}', x)
    .replace('{y}', y);

  return fetch(mapSource)
    .then(response => response.blob())
    .then(response => {
      const { type } = response || {};
      if (type !== 'application/xml' && type !== 'text/xml' && type !== 'text/html') {
        const src = URL.createObjectURL(response);
        const image = new Image();

        image.src = src;
        return image;
      }

      return false;
    });
};

const RasterLayer = layerModel => {
  const {
    source = {},
    render = {},
    params,
    sqlParams,
    decodeParams,
    id,
    opacity,
    decodeFunction
  } = layerModel;

  const sourceParsed =
    source.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

  const renderParsed =
    render.parse === false
      ? render
      : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

  let layer = {};

  // if decoded layer use custom deck layer
  if (decodeFunction) {
    layer = {
      id,
      type: 'custom',
      layers: [
        {
          id: `${id}-raster-decode-bg`,
          type: 'background',
          paint: {
            'background-color': 'transparent'
          },
          ...renderParsed
        },
        ...sourceParsed.tiles.map(
          t =>
            new MapboxLayer({
              id: `${id}-raster-decode`,
              type: TileLayer,
              getTileData: e => getTileData(e, t),
              renderSubLayers: ({
                id: subLayerId,
                data,
                tile,
                visible,
                zoom,
                decodeParams: decodeParamsSub,
                decodeFunction: decodeFunctionSub
              }) => {
                if (data && data.src) {
                  return new DecodedLayer({
                    id: subLayerId,
                    image: data.src,
                    bounds: tile.bbox,
                    visible,
                    zoom,
                    decodeParams: decodeParamsSub,
                    decodeFunction: decodeFunctionSub,
                    opacity
                  });
                }
                return null;
              },
              opacity: layerModel.opacity,
              decodeParams,
              decodeFunction
            })
        )
      ]
    };
  } else {
    layer = {
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tileSize: 256,
        ...sourceParsed
      },
      layers: [
        {
          id: `${id}-raster`,
          type: 'raster',
          source: id,
          ...renderParsed
        }
      ]
    };
  }

  return new Promise((resolve, reject) => {
    if (layer) {
      resolve(layer);
    } else {
      reject(new Error('error in layer config'));
    }
  });
};

export default RasterLayer;
