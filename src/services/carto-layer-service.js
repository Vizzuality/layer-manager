import Promise from 'bluebird';
import { get, replace } from 'src/helpers';

const cartoLayerService = (layerModel) => {
  const { layerConfig, params, sqlParams, interactivity } = layerModel;
  let { layerRequest } = layerModel;

  const layerCongigParsed = JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  const layerTpl = {
    version: '1.3.0',
    stat_tag: 'API',
    layers: layerCongigParsed.body.layers.map((l) => {
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

  const apiParams = `?stat_tag=API&config=${encodeURIComponent(JSON.stringify(layerTpl))}`;
  const url = `https://${layerCongigParsed.account}.carto.com/api/v1/map${apiParams}`;

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
