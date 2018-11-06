import { fetchData } from 'services/cluster-service';
import Supercluster from 'supercluster';

const { L } = typeof window !== 'undefined' ? window : {};

const defaultSizes = {
  50: 25,
  100: 30,
  1000: 40
};

const ClusterLayer = L && L.GeoJSON.extend({
  initialize(layerModel) {
    const self = this;
    L.GeoJSON.prototype.initialize.call(this, []);
    const { layerConfig, events, decodeClusters } = layerModel;
    if (!decodeClusters) {
      console.warn('You must provide a decodeClusters function');
      return;
    }
    const { html, sizes = defaultSizes, clusterIcon, icon } = layerModel.layerConfig || {};

    L.Util.setOptions(this, {
      // converts feature to icon
      pointToLayer(feature, latlng) {
        const isCluster = feature.properties && feature.properties.cluster;

        // if cluster return point icon
        if (!isCluster) {
          // see documentation for icon config https://leafletjs.com/reference-1.3.4.html#icon
          return L.marker(latlng, { icon: L.icon({ ...icon }) });
        }

        const count = feature.properties.point_count;
        let iconSize = null;

        if (typeof sizes === 'function') {
          iconSize = () => sizes(count)
        } else {
          const sizeKey = Object.keys(sizes).find(o => count <= parseInt(o, 10));
          const size = sizes[sizeKey];
          iconSize = L.point(size, size);
        }

        // see documentation for icon config https://leafletjs.com/reference-1.3.4.html#divicon
        return L.marker(latlng, {
          icon: L.divIcon({
            iconSize,
            html: html && typeof html === 'function' ?
              html(feature) :
              `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; ${clusterIcon.color ? `background-color: ${clusterIcon.color};` : ''}">${feature.properties.point_count_abbreviated}</div>`,
            ...clusterIcon
          })
        })
      },

      // parses each feature before adding to the map
      onEachFeature(feature, layer) {
        if (feature.properties && feature.properties.cluster) {
          layer.on({
            click: () => self.setMapView(feature)
          });
        } else if (events) {
          layer.on(Object.keys(events).reduce((obj, event) => ({
            ...obj,
            [event]: e => events[event]({ ...e, data: feature.properties })
          }), {}));
        }
      }
    });

    // https://github.com/mapbox/supercluster options available here
    const { clusterConfig } = layerConfig || {};
    this.supercluster = Supercluster({
      radius: 80,
      maxZoom: 16,
      ...clusterConfig
    });

    fetchData(layerModel)
      .then(response => {
        const features = decodeClusters(response);
        this.supercluster.load(features);
        this.update();
      })
  },

  setMapView(feature) {
    const center = feature.geometry.coordinates;
    const zoom = this.supercluster.getClusterExpansionZoom(feature.properties.cluster_id);
    this._map.setView(center.reverse(), zoom);
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
