import Promise from 'bluebird';
import { get } from '../../helpers';

const cartoLayerService = (layerModel) => {
  const layerConfig = layerModel.get('layerConfig');
  const interactivity = layerModel.get('interactivity');
  let request = layerModel.get('layerRequest');

  const layerTpl = {
    version: '1.3.0',
    stat_tag: 'API',
    layers: layerConfig.body.layers.map((l) => {
      if (!!interactivity && interactivity.length) {
        return {
          ...l,
          options: {
            ...l.options,
            interactivity
          }
        };
      }
      return l;
    })
  };

  const params = `?stat_tag=API&config=${encodeURIComponent(JSON.stringify(layerTpl))}`;
  const url = `https://${layerConfig.account}.carto.com/api/v1/map${params}`;

  if (request && request instanceof Promise) request.cancel();

  request = get(url)
    .then((res) => {
      if (res.status > 400) throw new Error(res);
      return JSON.parse(res.response);
    });

  layerModel.setLayerRequest(request);

  return request;
};

export default cartoLayerService;
