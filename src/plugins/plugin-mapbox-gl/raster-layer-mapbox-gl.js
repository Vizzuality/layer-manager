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
  const { layerConfig, params, sqlParams, decodeParams, id, opacity, decodeFunction } = layerModel;

  const layerConfigParsed =
    layerConfig.parse === false
      ? layerConfig
      : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
  let tileUrl;

  const { body, url } = layerConfigParsed || {};
  const { paint, minzoom, maxzoom } = body || {};

  switch (layerModel.provider) {
    case 'gee':
      tileUrl =
        url || body.url || `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;
      break;
    default:
      tileUrl = url || body.url;
      break;
  }

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
          ...(maxzoom && {
            maxzoom
          }),
          ...(minzoom && {
            minzoom
          })
        },
        new MapboxLayer({
          id: `${id}-raster-decode`,
          type: TileLayer,
          minZoom: minzoom,
          maxZoom: maxzoom,
          getTileData: e => getTileData(e, url || body.url),
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
      ]
    };
  } else {
    layer = {
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256
      },
      layers: [
        {
          id: `${id}-raster`,
          type: 'raster',
          source: id,
          ...(maxzoom && {
            maxzoom
          }),
          ...(minzoom && {
            minzoom
          }),
          paint: {
            ...paint,
            'raster-opacity': opacity || 1
          }
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
