'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchTile = undefined;

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

exports.default = { fetchTile: fetchTile };