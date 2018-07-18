import Promise from 'bluebird';
import cartoService from 'src/services/carto-layer-service';

import { replace } from 'src/helpers';

const { L } = window;

const CartoLayer = (layerModel) => {
  if (!L) throw new Error('Leaflet must be defined.');

  const { layerConfig, params, sqlParams, interactivity } = layerModel;
  const layerConfigParsed = JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  return new Promise((resolve, reject) => {
    cartoService(layerModel)
      .then((response) => {
        const tileUrl = `${response.cdn_url.templates.https.url}/${layerConfigParsed.account}/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;
        const layer = L.tileLayer(tileUrl);

        // Add interactivity
        if (interactivity && interactivity.length) {
          const gridUrl = `https://${layerConfigParsed.account}.carto.com/api/v1/map/${response.layergroupid}/0/{z}/{x}/{y}.grid.json`;
          const interactiveLayer = L.utfGrid(gridUrl);

          const LayerGroup = L.LayerGroup.extend({
            group: true,
            setOpacity: (opacity) => {
              layerModel.mapLayer.eachLayer((l) => {
                l.setOpacity(opacity);
              });
            }
          });

          resolve(new LayerGroup([
            layer,
            interactiveLayer
          ]));
        }

        resolve(layer);
      })
      .catch(err => reject(err));
  });
};

export default CartoLayer;
