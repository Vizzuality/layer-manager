import { CancelToken } from 'axios';
import { get } from 'lib/request';

export const fetchData = (layerModel) => {
  const source = CancelToken.source();
  const { layerConfig } = layerModel;
  const { layerRequest } = layerModel;
  const { url } = layerConfig.body;

  if (layerRequest && layerRequest instanceof Promise) {
    source.cancel('Operation canceled by the user.');
  }

  const newLayerRequest = get(url, { cancelToken: source.token }).then((res) => {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newLayerRequest;
};

export default { fetchData };
