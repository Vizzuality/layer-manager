import { CancelToken } from 'axios';
import { get } from 'lib/request';

export const fetchData = (layerModel) => {
  const { layerConfig, layerRequest } = layerModel;
  const { url } = layerConfig.body;

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

export default { fetchData };
