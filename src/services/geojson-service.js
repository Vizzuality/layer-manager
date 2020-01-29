import { replace } from 'utils/query';
import { CancelToken } from 'axios';
import { get } from 'lib/request';

export const fetchGeojsonData = layerModel => {
  const { source, params, sqlParams, layerRequest } = layerModel;

  const sourceParsed =
    source.parse === false || typeof source.parse === 'function'
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

  const { data } = sourceParsed || {};

  if (layerRequest) {
    layerRequest.cancel('Operation canceled by the user.');
  }

  const layerRequestSource = CancelToken.source();
  layerModel.set('layerRequest', layerRequestSource);

  const newLayerRequest = get(data, { cancelToken: layerRequestSource.token }).then(res => {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newLayerRequest;
};

export default { fetchGeojsonData };
