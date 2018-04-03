import Promise from 'bluebird';
import { post } from '../../helpers';

let postRequest;

const cartoLayerService = (layerModel) => {
  const layerConfig = layerModel.get('layerConfig');

  // Transforming layerSpec
  const bodyStringified = JSON.stringify(layerConfig.body || {})
    .replace(/"cartocss-version":/g, '"cartocss_version":')
    .replace(/"geom-column"/g, '"geom_column"')
    .replace(/"geom-type"/g, '"geom_type"')
    .replace(/"raster-band"/g, '"raster_band"');
  const url = `https://${layerConfig.account}.carto.com/api/v1/map`;

  if (postRequest && postRequest instanceof Promise) postRequest.cancel();

  postRequest = post(url, JSON.parse(bodyStringified))
    .then((res) => {
      if (res.status > 400) throw new Error(res);
      return JSON.parse(res.response);
    });

  return postRequest;
};

export default cartoLayerService;
