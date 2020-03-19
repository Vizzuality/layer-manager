import { fetch } from 'utils/request';
import omit from 'lodash/omit';

export default {
  carto: (layerModel, layer, resolve, reject) => {
    const { interactivity, source } = layerModel;
    const { provider } = source;

    const layerTpl = JSON.stringify({
      version: '1.3.0',
      stat_tag: 'API',
      layers: provider.layers.map(l => {
        if (!!interactivity && interactivity.length) {
          return { ...l, options: { ...l.options, interactivity } };
        }
        return l;
      })
    });

    // https://carto.com/developers/auth-api/guides/how-to-send-API-Keys/
    const apiParams = {
      stat_tag: 'API',
      config: encodeURIComponent(layerTpl),
      ...(provider.api_key && { api_key: provider.api_key })
    };
    const apiParamsString = Object.keys(apiParams)
      .map(k => `${k}=${apiParams[k]}`)
      .join('&');
    const url = `https://${provider.account}.carto.com/api/v1/map?${apiParamsString}`;

    fetch('get', url, {}, layerModel)
      .then(response => {
        const ext = layerModel.type === 'vector' ? 'mvt' : 'png';
        const tileUrl = `${response.cdn_url.templates.https.url.replace('{s}', 'a')}/${
          provider.account
        }/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.${ext}`;

        return resolve({
          ...layer,
          source: {
            ...omit(layer.source, 'provider'),
            tiles: [tileUrl]
          }
        });
      })
      .catch(err => reject(err));
  }
};
