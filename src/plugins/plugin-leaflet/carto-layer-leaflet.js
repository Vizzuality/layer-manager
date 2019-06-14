import { fetchTile, fetchBounds } from 'services/carto-service';
import { replace } from 'utils/query';

const { L } = typeof window !== 'undefined' ? window : {};

const CartoLayer = (layerModel) => {
  if (!L) throw new Error('Leaflet must be defined.');

  const { layerConfig, params, sqlParams, interactivity } = layerModel;
  const layerConfigParsed = layerConfig.parse === false
    ? layerConfig
    : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

  return new Promise((resolve, reject) => {
    fetchTile(layerModel)
      .then((response) => {
        const tileUrl = `https://${response.cdn_url.https}/ra/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;
        const layer = L.tileLayer(tileUrl);

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
      })
      .catch(err => reject(err));
  });
};

CartoLayer.getBounds = (layerModel) => {
  if (!L) throw new Error('Leaflet must be defined.');

  return fetchBounds(layerModel).then((response) => {
    const { maxy, maxx, miny, minx } = response.rows[0];
    const bounds = [
      [maxy, maxx],
      [miny, minx]
    ];

    return bounds;
  });
};

export default CartoLayer;
