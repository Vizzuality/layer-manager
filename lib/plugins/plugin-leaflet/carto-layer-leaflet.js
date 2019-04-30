'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _cartoService = require('../../services/carto-service');

var _query = require('../../utils/query');

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var CartoLayer = function CartoLayer(layerModel) {
  if (!L) throw new Error('Leaflet must be defined.');

  var layerConfig = layerModel.layerConfig,
      params = layerModel.params,
      sqlParams = layerModel.sqlParams,
      interactivity = layerModel.interactivity;

  var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse((0, _query.replace)(JSON.stringify(layerConfig), params, sqlParams));

  return new Promise(function (resolve, reject) {
    (0, _cartoService.fetchTile)(layerModel).then(function (response) {
      var tileUrl = 'https://' + response.cdn_url.https + '/ra/api/v1/map/' + response.layergroupid + '/{z}/{x}/{y}.png';
      var layer = L.tileLayer(tileUrl);

      // Add interactivity
      // if (interactivity && interactivity.length) {
      //   const gridUrl = `https://${layerConfigParsed.account}-cdn.resilienceatlas.org/user/ra/api/v1/map/${response.layergroupid}/0/{z}/{x}/{y}.grid.json`;
      //   const interactiveLayer = L.utfGrid(gridUrl);

      //   const LayerGroup = L.LayerGroup.extend({
      //     group: true,
      //     setOpacity: (opacity) => {
      //       layerModel.mapLayer.getLayers().forEach((l) => {
      //         l.setOpacity(opacity);
      //       });
      //     }
      //   });

      //   return resolve(new LayerGroup([layer, interactiveLayer]));
      // }

      return resolve(layer);
    }).catch(function (err) {
      return reject(err);
    });
  });
};

exports.default = CartoLayer;