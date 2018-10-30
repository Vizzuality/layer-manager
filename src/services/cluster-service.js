import Promise from 'bluebird';
import { get } from 'lib/request';

export const fetchData = layerModel => {
  const { layerConfig } = layerModel;
  const { layerRequest } = layerModel;
  const { url } = layerConfig.body;

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

export default { fetchData };
