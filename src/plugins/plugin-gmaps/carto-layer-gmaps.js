import Promise from 'bluebird';
import cartoService from 'src/services/carto-layer-service';

const { google } = window;

const CartoLayer = (layerSpec) => {
  const { layerConfig } = layerSpec;

  return new Promise((resolve, reject) => {
    cartoService(layerSpec)
      .then((response) => {
        const tileUrl = `${response.cdn_url.templates.https.url}/${layerConfig.account}/api/v1/map/${response.layergroupid}/{z}/{x}/{y}.png`;
        const layer = new google.maps.ImageMapType({
          name: layerSpec.slug,
          getTileUrl(coord, zoom) {
            const url = tileUrl
              .replace('{x}', coord.x)
              .replace('{y}', coord.y)
              .replace('{z}', zoom);
            return url;
          },
          tileSize: new google.maps.Size(256, 256),
          minZoom: 1,
          maxZoom: 20
        });

        resolve(layer);
      })
      .catch(err => reject(err));
  });
};

export default CartoLayer;
