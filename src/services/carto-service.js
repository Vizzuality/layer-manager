import { CancelToken } from 'axios';
import { get } from 'lib/request';
import { replace } from 'utils/query';

export const fetchTile = (layerModel) => {
  const { layerConfig, params, sqlParams, interactivity } = layerModel;

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  const layerTpl = JSON.stringify({
    version: '1.3.0',
    stat_tag: 'API',
    layers: layerConfigParsed.body.layers.map((l) => {
      if (!!interactivity && interactivity.length) {
        return { ...l, options: { ...l.options, interactivity: interactivity.split(', ') } };
      }
      return l;
    }),
  });
  const apiParams = `?stat_tag=API&config=${encodeURIComponent(layerTpl)}`;

  const url = `https://${layerConfigParsed.account}-cdn.resilienceatlas.org/user/ra/api/v1/map${apiParams}`;

  const { layerRequest } = layerModel;
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

export const fetchBounds = (layerModel) => {
  const { layerConfig, params, sqlParams, type } = layerModel;
  let { sql } = layerModel;

  if (type === 'raster') {
    sql = `SELECT ST_Union(ST_Transform(ST_Envelope(the_raster_webmercator), 4326)) as the_geom FROM (${sql}) as t`;
  }

  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));


  const s = `
    SELECT ST_XMin(ST_Extent(the_geom)) as minx,
    ST_YMin(ST_Extent(the_geom)) as miny,
    ST_XMax(ST_Extent(the_geom)) as maxx,
    ST_YMax(ST_Extent(the_geom)) as maxy
    from (${sql}) as subq
  `;

  const url = `https://${layerConfigParsed.account}-cdn.resilienceatlas.org/user/ra/api/v2/sql?q=${s.replace(/\n/g, ' ')}`;

  const { boundsRequest } = layerModel;
  if (boundsRequest) {
    boundsRequest.cancel('Operation canceled by the user.');
  }

  const boundsRequestSource = CancelToken.source();
  layerModel.set('boundsRequest', boundsRequestSource);

  const newBoundsRequest = get(url, { cancelToken: boundsRequestSource.token }).then((res) => {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newBoundsRequest;
};

export default { fetchTile, fetchBounds };
