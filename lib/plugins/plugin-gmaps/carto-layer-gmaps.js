'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cartoService = require('../../services/carto-service');

var _query = require('../../utils/query');

var _ref = typeof window !== 'undefined' ? window : {},
    google = _ref.google;

var CartoLayer = function CartoLayer(layerModel) {
  if (!google) throw new Error('Google maps must be defined.');

  var layerConfig = layerModel.layerConfig,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams;

  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  return new Promise(function (resolve, reject) {
    (0, _cartoService.fetchTile)(layerModel).then(function (response) {
      var tileUrl = response.cdn_url.templates.https.url + '/' + layerConfigParsed.account + '/api/v1/map/' + response.layergroupid + '/{z}/{x}/{y}.png';
      var layer = new google.maps.ImageMapType({
        name: layerConfigParsed.slug,
        getTileUrl: function getTileUrl(coord, zoom) {
          var url = tileUrl.replace('{x}', coord.x).replace('{y}', coord.y).replace('{z}', zoom);
          return url;
        },

        tileSize: new google.maps.Size(256, 256),
        minZoom: 1,
        maxZoom: 20
      });

      return resolve(layer);
    }).catch(function (err) {
      return reject(err);
    });
  });
};

exports.default = CartoLayer;