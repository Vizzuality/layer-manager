import { fetchData } from 'services/cluster-service';
import Supercluster from 'supercluster';

const { L } = typeof window !== 'undefined' ? window : {};

const ClusterLayer = L && L.GeoJSON.extend({
  options: {
    pointToLayer: (feature, latlng) => {
      const isCluster = feature.properties && feature.properties.cluster;
      if (!isCluster) return L.marker(latlng, {

      });
      const count = feature.properties.point_count;
      let size = 25;
      if (count > 100) size = 30;
      if (count > 1000) size = 40;
      const icon = L.divIcon({
        html: `<div style="width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: orange; color: white; font-size: 14px;">${feature.properties.point_count_abbreviated}</div>`,
        iconSize: L.point(size,size),
        className: 'c-cluster-icon'
      });

      return L.marker(latlng, {
        icon
      }).on('click', () => {
        const { geometry, properties } = feature;
        if (isCluster) {
          const center = geometry.coordinates;
          const zoom = this.supercluster.getClusterExpansionZoom(properties.cluster_id);

          this.map.setCenter(center);
          this.map.setZoom(zoom);
        }
      });
    }
  },

  initialize(layerModel, options = {}) {
    L.GeoJSON.prototype.initialize.call(this, []);
    L.Util.setOptions(this, options);
    this.supercluster = Supercluster({
      radius: 80,
      maxZoom: 16
    });

    fetchData(layerModel)
      .then(response => {
        const features = response.data.map(d => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [d.attributes.lng, d.attributes.lat]
          }
        }));

        this.supercluster.load(features);
        this.update();
      })
  },

  onAdd(map) {
		L.GeoJSON.prototype.onAdd.call(this, map);
    map.on('moveend zoomend', this.onMove, this);
  },

  onRemove(map) {
    map.off('moveend zoomend', this.onMove, this);
    this.clear();
  },

  onMove() {
    this.clear();
    this.update();
  },

  update() {
    const zoom = this._map.getZoom();
    const bounds = this._map.getBounds();
    const clusterBounds = [
      bounds._southWest.lng,
      bounds._southWest.lat,
      bounds._northEast.lng,
      bounds._northEast.lat,
    ]
    const clusters = this.supercluster.getClusters(clusterBounds, zoom);
    this.addData(clusters);
  },

  clear() {
		L.GeoJSON.prototype.clearLayers.call(this, []);
  }

});

export default ClusterLayer;
