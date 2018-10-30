import Promise from 'bluebird';
import { fetchData } from 'services/cluster-service';
import Supercluster from 'supercluster';

const { L } = typeof window !== 'undefined' ? window : {};

const ClusterLayer = layerModel => {
  if (!L) throw new Error('Leaflet must be defined.');

  return new Promise((resolve, reject) => {
    fetchData(layerModel)
      .then(response => {
        const features = response.data.map(d => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [d.attributes.lat, d.attributes.lng]
          }
        }));

        const supercluster = Supercluster({
          log: true,
          radius: 10,
          maxZoom: 16
        }).load(features);
        const clusters = supercluster.getClusters([-179.99, -84.99, 179.99, 84.99], 3);
        const layer = L.geoJSON(clusters);

        return resolve(layer);
      })
      .catch(err => reject(err));
  });
};

export default ClusterLayer;
