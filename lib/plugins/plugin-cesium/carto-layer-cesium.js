'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cartoService = require('../../services/carto-service');

exports.default = function (Cesium) {
  return function (layerModel) {
    return (0, _cartoService.fetchTile)(layerModel).then(function (response) {
      var layerConfig = layerModel.layerConfig;

      var url = response.cdn_url.templates.https.url + '/' + layerConfig.account + '/api/v1/map/' + response.layergroupid + '/{z}/{x}/{y}.png';
      var provider = new Cesium.UrlTemplateImageryProvider({ url: url });
      provider.errorEvent.addEventListener(function () {
        return false;
      });
      // don't show warnings
      return new Cesium.ImageryLayer(provider);
    });
  };
};