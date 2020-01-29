import Promise from 'utils/promise';

import { replace } from 'utils/query';
import { fetchCartoAnonymous } from 'services/carto-service';

import { getVectorStyleLayers } from 'utils/vector-style-layers';
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

  const DEFAULT_RASTER_OPTIONS = {
    id: `${id}-raster`,
    type: 'raster',
    source: id
  };

  const sourceParsed =
    source.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

  const { provider } = sourceParsed;

  const renderParsed =
    render.parse === false
      ? render
      : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

  const {
    layers = [DEFAULT_RASTER_OPTIONS] // Set the default to this to
  } = renderParsed;

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
          }
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
              minZoom: sourceParsed.minzoom,
              maxZoom: sourceParsed.maxzoom,
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
      layers: getVectorStyleLayers(
        layers.map(l => ({
          ...DEFAULT_RASTER_OPTIONS,
          ...l
        })),
        layerModel
      )
    };
  }

  if (provider && (provider.type === 'cartodb' || provider.type === 'carto')) {
    return new Promise((resolve, reject) => {
      fetchCartoAnonymous(layerModel)
        .then(response => {
          const tileUrl = `${response.cdn_url.templates.https.url.replace('{s}', 'a')}/${
            provider.options.account
          }/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;

          return resolve({
            ...layer,
            source: {
              type: 'raster',
              tileSize: 256,
              tiles: [tileUrl]
            }
          });
        })
        .catch(err => reject(err));
    });
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
