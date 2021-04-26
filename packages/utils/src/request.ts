import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';

const defaultHeaders: AxiosRequestConfig["headers"] = {
  'Content-Type': 'application/json'
};

export const get = (
  url: string,
  options: Partial<AxiosRequestConfig> = {},
): AxiosPromise =>
  axios({
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    url,
    method: 'get',
  });

export const post = (
  url: string,
  body:AxiosRequestConfig['data'],
  options: Partial<AxiosRequestConfig> = {},
): AxiosPromise =>
  axios({
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    data: body,
    url,
    method: 'post',
  });

export const fetch = (
  type: AxiosRequestConfig["method"],
  url: string,
  options: Partial<AxiosRequestConfig> = {},
  layerModel: any, // TO-DO: change to layer model type
): AxiosPromise => {
  const { layerRequest } = layerModel;

  if (layerRequest) {
    layerRequest.cancel('Operation canceled by the user.');
  }

  const layerRequestSource = axios.CancelToken.source();
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
