import axios from 'axios';

import type { AxiosPromise, AxiosRequestConfig } from 'axios';

const defaultHeaders: AxiosRequestConfig['headers'] = {
  'Content-Type': 'application/json',
};

export const get = (
  url: string,
  options: Partial<AxiosRequestConfig> = {},
): AxiosPromise => axios({
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
): AxiosPromise => axios({
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
  type: AxiosRequestConfig['method'],
  url: string,
  options: Partial<AxiosRequestConfig> = {},
  layerModel: any,
): AxiosPromise => {
  const { layerRequest, setLayerRequest } = layerModel;

  if (layerRequest) {
    layerRequest.cancel('Operation canceled by the user.');
  }

  const layerRequestSource = axios.CancelToken.source();
  setLayerRequest(layerRequestSource);

  const method = type === 'post' ? post : get;

  const newLayerRequest = method(url, {
    ...options,
    cancelToken: layerRequestSource.token,
  }).then((res) => {
    if (res.status > 400) {
      throw new Error(res.data);
    }

    return res.data;
  });

  return newLayerRequest;
};
