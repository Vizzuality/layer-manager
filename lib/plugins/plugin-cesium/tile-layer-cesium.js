"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (Cesium) {
  return function (layerModel) {
    return new Promise(function (resolve) {
      var _layerModel$layerConf = layerModel.layerConfig,
          layerConfig = _layerModel$layerConf === undefined ? {} : _layerModel$layerConf;
      var url = layerConfig.body.url;

      var provider = new Cesium.UrlTemplateImageryProvider({ url: url });
      provider.errorEvent.addEventListener(function () {
        return false;
      });
      // don't show warnings
      resolve(new Cesium.ImageryLayer(provider));
    });
  };
};