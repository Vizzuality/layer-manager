'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchBounds = exports.fetchTile = undefined;

var _axios = require('axios');

var _request = require('../lib/request');

var _query = require('../utils/query');

var fetchTile = exports.fetchTile = function fetchTile(layerModel) {
  var layerConfig = layerModel.layerConfig,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams,
      interactivity = layerModel.interactivity;


  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  var layerTpl = JSON.stringify({
    version: '1.3.0',
    stat_tag: 'API',
    layers: layerConfigParsed.body.layers.map(function (l) {
      if (!!interactivity && interactivity.length) {
        return Object.assign({}, l, { options: Object.assign({}, l.options, { interactivity: interactivity.split(', ') }) });
      }
      return l;
    })
  });
  var apiParams = '?stat_tag=API&config=' + encodeURIComponent(layerTpl);

  var url = 'https://' + layerConfigParsed.account + '-cdn.resilienceatlas.org/user/ra/api/v1/map' + apiParams;

  var layerRequest = layerModel.layerRequest;

  if (layerRequest) {
    layerRequest.cancel('Operation canceled by the user.');
  }

  var layerRequestSource = _axios.CancelToken.source();
  layerModel.set('layerRequest', layerRequestSource);

  var newLayerRequest = (0, _request.get)(url, { cancelToken: layerRequestSource.token }).then(function (res) {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newLayerRequest;
};

var fetchBounds = exports.fetchBounds = function fetchBounds(layerModel) {
  var layerConfig = layerModel.layerConfig,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams,
      type = layerModel.type;
  var sql = layerModel.sql;


  if (type === 'raster') {
    sql = 'SELECT ST_Union(ST_Transform(ST_Envelope(the_raster_webmercator), 4326)) as the_geom FROM (' + sql + ') as t';
  }

  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  var s = '\n    SELECT ST_XMin(ST_Extent(the_geom)) as minx,\n    ST_YMin(ST_Extent(the_geom)) as miny,\n    ST_XMax(ST_Extent(the_geom)) as maxx,\n    ST_YMax(ST_Extent(the_geom)) as maxy\n    from (' + sql + ') as subq\n  ';

  var url = 'https://' + layerConfigParsed.account + '-cdn.resilienceatlas.org/user/ra/api/v2/sql?q=' + s.replace(/\n/g, ' ');

  var boundsRequest = layerModel.boundsRequest;

  if (boundsRequest) {
    boundsRequest.cancel('Operation canceled by the user.');
  }

  var boundsRequestSource = _axios.CancelToken.source();
  layerModel.set('boundsRequest', boundsRequestSource);

  var newBoundsRequest = (0, _request.get)(url, { cancelToken: boundsRequestSource.token }).then(function (res) {
    if (res.status > 400) {
      console.error(res);
      return false;
    }

    return res.data;
  });

  return newBoundsRequest;
};

exports.default = { fetchTile: fetchTile, fetchBounds: fetchBounds };