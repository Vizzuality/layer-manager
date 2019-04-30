import { CancelToken } from 'axios';
import { get } from 'lib/request';
import { replace } from 'utils/query';

export const fetchTile = (layerModel) => {
  const { layerConfig, params, sqlParams, interactivity } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
  const layerTpl = JSON.stringify({
    version: '1.3.0',
    stat_tag: 'API',
    layers: layerConfigParsed.body.layers.map((l) => {
      if (!!interactivity && interactivity.length) {
        return { ...l, options: { ...l.options, interactivity: interactivity.split(', ') } };
      }
      return l;
    }),
  });
  const apiParams = `?stat_tag=API&config=${encodeURIComponent(layerTpl)}`;
  const url = `https://${layerConfigParsed.account}-cdn.resilienceatlas.org/user/ra/api/v1/map${apiParams}`;

  const { layerRequest } = layerModel;
  if (layerRequest) {
    layerRequest.cancel('Operation canceled by the user.');
  }

  const layerRequestSource = CancelToken.source();
  layerModel.set('layerRequest', layerRequestSource);

  const newLayerRequest = get(url, { cancelToken: layerRequestSource.token }).then((res) => {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newLayerRequest;
};

export default { fetchTile };
