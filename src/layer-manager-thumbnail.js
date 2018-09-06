export function getImageFromCarto({
  width, height, zoom, lat, lng, layerConfig
}) {
  if (!layerConfig) throw Error('layerConfig param is required');
  if (!layerConfig.body) throw Error('layerConfig does not have body param');

  const { body, account } = layerConfig;
  const format = 'png';
  const layerTpl = { version: '1.3.0', stat_tag: 'API', layers: body.layers };
  const params = `?stat_tag=API&config=${encodeURIComponent(JSON.stringify(layerTpl))}`;
  const url = `https://${account}.carto.com/api/v1/map${params}`;

  return fetch(url)
    .then((response) => {
      if (response.status >= 400) throw new Error(response.json());
      return response.json();
    })
    .then((data) => {
      const { layergroupid } = data;
      return `https://${data.cdn_url.https}/${account}/api/v1/map/static/center/${layergroupid}/${zoom}/${lat}/${lng}/${width}/${height}.${format}`;
    });
};

export function getImageFromMapService({ width, height, layerConfig }) {
  if (!layerConfig) throw Error('layerConfig param is required');
  if (!layerConfig.body) throw Error('layerConfig does not have body param');

  const { body } = layerConfig;
  const { url } = body;

  // BBOX for zoom 1, lat 20, long -20
  const bbox = '-125.15625000000001,-55.7765730186677,85.78125,72.81607371878991';
  const bboxSR = encodeURIComponent(JSON.stringify({ wkid: 4326 }));
  const imageSR = encodeURIComponent(JSON.stringify({ wkid: 3857 }));
  const format = 'png';

  const result = `${url}/export?bbox=${bbox}&bboxSR=${bboxSR}&layers=&layerDefs=&size=${width}%2C${height}&imageSR=${imageSR}&format=${format}&transparent=true&dpi=&time=&layerTimeOptions=&dynamicLayers=&gdbVersion=&mapScale=&rotation=&f=image`;

  return result;
};

export function getImageForGEE({ layerSpec }) {
  const { layerConfig } = layerSpec;

  if (!layerConfig) throw Error('layerConfig param is required');
  if (!layerConfig.body) throw Error('layerConfig does not have body param');

  const tile = `${process.env.WRI_API_URL}/layer/${layerSpec.id}/tile/gee/0/0/0`;

  return tile;
};

export function getImageForLeaflet({ layerSpec }) {
  const { layerConfig } = layerSpec;

  if (!layerConfig) throw Error('layerConfig param is required');
  if (!layerConfig.body) throw Error('layerConfig does not have body param');

  if (layerConfig.type !== 'tileLayer') {
    return null;
  }

  const tile = layerConfig.url.replace('{z}', '0').replace('{x}', '0').replace('{y}', '0');

  return tile;
};

export async function getLayerImage ({
  width = 400,
  height = 300,
  zoom = 0,
  lat = 0,
  lng = 0,
  layerSpec
}) {
  if (!layerSpec) throw Error('No layerSpec specified.');

  const { layerConfig, provider } = layerSpec;
  let result;

  switch (provider) {
    case 'carto':
      try {
        result = await getImageFromCarto({
          width, height, zoom, lat, lng, layerConfig
        });
      } catch (e) {
        result = null;
      }
      break;
    case 'cartodb':
      try {
        result = await getImageFromCarto({
          width, height, zoom, lat, lng, layerConfig
        });
      } catch (e) {
        result = null;
      }
      break;
    case 'mapservice':
      result = getImageFromMapService({ width, height, layerConfig });
      break;
    case 'featureservice':
      result = getImageFromMapService({ width, height, layerConfig });
      break;
    case 'arcgis':
      result = getImageFromMapService({ width, height, layerConfig });
      break;
    case 'gee':
      result = getImageForGEE({ layerSpec });
      break;
    case 'leaflet':
      result = getImageForLeaflet({ layerSpec });
      break;
    default:
      result = null;
  }

  return result;
};


export default {
  getLayerImage,
  getImageFromCarto,
  getImageFromMapService,
  getImageForGEE,
  getImageForLeaflet
};