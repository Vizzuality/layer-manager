import axios, { CancelToken } from 'axios';

const headers = {
  'Content-Type': 'application/json'
};

export const get = (url, options = {}) =>
  axios.get(url, {
    headers,
    ...options
  });

export const post = (url, body) => axios.post(url, body, { headers });

export const fetch = (type, url, options, layerModel) => {
  const { layerRequest } = layerModel;

  if (layerRequest) {
    layerRequest.cancel('Operation canceled by the user.');
  }

  const layerRequestSource = CancelToken.source();
  layerModel.set('layerRequest', layerRequestSource);

  const method = type === 'post' ? post : get;

  const newLayerRequest = method(url, {
    ...options,
    cancelToken: layerRequestSource.token
  }).then(res => {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newLayerRequest;
};

export default { get, post, fetch };
