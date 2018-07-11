import Promise from 'bluebird';
import { get } from '../../helpers';

export default (layerModel) => {
  const layerConfig = layerModel.get('layerConfig');
  const id = { layerConfig };
  let request = layerModel.get('layerRequest');

  const tileUrl = `${config.apiUrlRW}/layer/${id}/tile/gee/{z}/{x}/{y}`;
  const layer = L.tileLayer(tileUrl);

   if (request && request instanceof Promise) request.cancel();

  request = get(url)
    .then((res) => {
      if (res.status > 400) throw new Error(res);
      return JSON.parse(res.response);
    });

  layerModel.setLayerRequest(request);

  return request;
};
