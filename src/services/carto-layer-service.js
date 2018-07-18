import Promise from 'bluebird';
import { get } from 'src/helpers';

const cartoLayerService = (layerModel) => {
  const { layerConfig, interactivity } = layerModel;
  let { layerRequest } = layerModel;

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

  if (layerRequest && layerRequest instanceof Promise) layerRequest.cancel();

  layerRequest = get(url)
    .then((res) => {
      if (res.status > 400) throw new Error(res);
      return JSON.parse(res.response);
    });

  layerModel.setLayerRequest(layerRequest);

  return layerRequest;
};

export default cartoLayerService;
