import { replace } from 'utils/query';
import { TileLayer } from 'deck.gl';
import { MapboxLayer } from '@deck.gl/mapbox';
// import { TileLayer } from '@deck.gl/geo-layers';
import BitmapLayer from './custom-layers/bitmap-layer';

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

const tile2long = (x, z) => (x / Math.pow(2, z) * 360 - 180);

const tile2lat = (y, z) => {
  const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
  return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
};

const RasterLayer = (layerModel) => {
  const {
    layerConfig,
    params,
    sqlParams,
    decodeParams,
    id,
    opacity,
    decodeFunction
  } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
  let tileUrl;

  const { body, url } = layerConfigParsed || {};
  const { paint, minzoom, maxzoom } = body || {};

  switch (layerModel.provider) {
    case 'gee':
      tileUrl = `https://api.resourcewatch.org/v1/layer/${id}/tile/gee/{z}/{x}/{y}`;
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
        new MapboxLayer({
          id: `${id}-raster-decode`,
          type: TileLayer,
          minZoom: minzoom,
          maxZoom: maxzoom,
          getTileData: e => getTileData(e, url || body.url),
          renderSubLayers: (props) => {
            const { tile } = props;
            const { x, y, z, _data } = tile;

            if (_data && _data.src) {
              // Supported formats:
              // - Coordinates of the bounding box of the bitmap `[minX, minY, maxX, maxY]`
              // - Coordinates of four corners of the bitmap, should follow the sequence of `[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]`
              // each position could be `[x, y]` or `[x, y, z]` format.

              const topLeft = [tile2long(x, z), tile2lat(y, z)];
              const topRight = [tile2long(x + 1, z), tile2lat(y, z)];
              const bottomLeft = [tile2long(x, z), tile2lat(y + 1, z)];
              const bottomRight = [tile2long(x + 1, z), tile2lat(y + 1, z)];
              const bounds = [bottomLeft, topLeft, topRight, bottomRight];
              console.log(bounds, _data.src);
              return new BitmapLayer({
                id: `${id}-${x}-${y}-${z}`,
                image: _data.src,
                bounds,
                // desaturate: 0,
                // transparentColor: [0, 0, 0, 0],
                // // visible: true,
                // tintColor: [255, 255, 255],
                // fp64: true,
                // zoom: 3,
                // decodeParams,
                // decodeFunction,
                // opacity
              });
            }

            return null;
          }
        }),
        {
          id: `${id}-raster`,
          type: 'background',
          paint: {
            'background-color': 'transparent'
          },
          ...maxzoom && {
            maxzoom
          },
          ...minzoom && {
            minzoom
          }
        }
      ]
    };
  } else {
    layer = {
      id,
      type: 'raster',
      source: {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
      },
      layers: [{
        id: `${id}-raster`,
        type: 'raster',
        source: id,
        ...maxzoom && {
          maxzoom
        },
        ...minzoom && {
          minzoom
        },
        paint: {
          ...paint,
          'raster-opacity': opacity || 1
        }
      }]
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
