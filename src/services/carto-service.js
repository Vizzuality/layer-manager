import Promise from 'bluebird';
import { get } from 'lib/request';
import { replace } from 'lib/query';

export const fetchTile = layerModel => {
  const { layerConfig, params, sqlParams, interactivity } = layerModel;
  const { layerRequest } = layerModel;

  const layerConfigParsed = (layerConfig.parse === false) ? layerConfig : JSON.parse(
    replace(JSON.stringify(layerConfig), params, sqlParams)
  );
  const layerTpl = JSON.stringify({
    version: '1.3.0',
    stat_tag: 'API',
    layers: layerConfigParsed.body.layers.map(l => {
      if (!!interactivity && interactivity.length) {
        return { ...l, options: { ...l.options, interactivity } };
      }
      return l;
    })
  });
  const apiParams = `?stat_tag=API&config=${encodeURIComponent(layerTpl)}`;
  const url = `https://${layerConfigParsed.account}.carto.com/api/v1/map${apiParams}`;

  if (layerRequest && layerRequest instanceof Promise) layerRequest.cancel();

  const newLayerRequest = get(url).then(res => {
    if (res.status > 400) {
      console.error(res);
      return false;
    }
    return JSON.parse(res.response);
  });

  layerModel.set('layerRequest', newLayerRequest);

  return newLayerRequest;
};

export default { fetchTile };
