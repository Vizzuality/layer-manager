'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchData = undefined;

var _axios = require('axios');

var _request = require('../lib/request');

var fetchData = exports.fetchData = function fetchData(layerModel) {
  var layerConfig = layerModel.layerConfig,
      layerRequest = layerModel.layerRequest;
  var url = layerConfig.body.url;


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

exports.default = { fetchData: fetchData };