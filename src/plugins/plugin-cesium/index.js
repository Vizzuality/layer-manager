import cartoLayer from './carto-layer-cesium';
import tileLayer from './tile-layer-cesium';

class PluginCesium {
  static Cesium = typeof window !== 'undefined' ? window.Cesium : null;

  constructor(map) {
    const { Cesium } = PluginCesium;
    this.map = map;
    this.eventListener = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);

    this.method = {
      carto: cartoLayer(Cesium),
      cartodb: cartoLayer(Cesium),
      cesium: tileLayer(Cesium)
    };
  }

  add(layerModel) {
    const { mapLayer } = layerModel;
    this.map.imageryLayers.add(mapLayer);
  }

  remove(layerModel) {
    const { mapLayer } = layerModel;
    this.map.imageryLayers.remove(mapLayer, true);
    this.eventListener.destroy();
  }

  getLayerByProvider(provider) {
    return this.method[provider];
  }

  setZIndex(layerModel, zIndex) {
    const { length } = this.map.imageryLayers;
    const { mapLayer } = layerModel;
    const layerIndex = zIndex >= length ? length - 1 : zIndex;
    const nextIndex = zIndex < 0 ? 0 : layerIndex;
    const currentIndex = this.map.imageryLayers.indexOf(mapLayer);
    if (currentIndex !== nextIndex) {
      const steps = nextIndex - currentIndex;
      for (let i = 0; i < Math.abs(steps); i++) {
        if (steps > 0) {
          this.map.imageryLayers.raise(mapLayer);
        } else {
          this.map.imageryLayers.lower(mapLayer);
        }
      }
    }
    return this;
  }

  setOpacity(layerModel, opacity) {
    const { mapLayer } = layerModel;
    mapLayer.alpha = opacity;
    return this;
  }

  setVisibility(layerModel, visibility) {
    const { mapLayer } = layerModel;
    mapLayer.show = visibility;
    return this;
  }

  setEvents(layerModel) {
    const { events } = layerModel;
    Object.keys(events).forEach(type => {
      const action = events[type];
      if (this.eventListener.getInputAction(type)) {
        this.eventListener.removeInputAction(type);
      }
      this.eventListener.setInputAction(this.getCoordinatesFromEvent(action), type);
    });
    return this;
  }

  setParams(layerModel) {
    this.remove(layerModel);
  }

  setLayerConfig(layerModel) {
    this.remove(layerModel);
  }

  setDecodeParams(layerModel) {
    console.info('Decode params callback', layerModel, this);
  }

  getCoordinatesFromEvent = action => event => {
    const { position } = event;
    const { Cesium } = PluginCesium;
    const clicked = new Cesium.Cartesian2(position.x, position.y);
    const { ellipsoid } = this.map.scene.globe;
    const cartesian = this.map.camera.pickEllipsoid(clicked, ellipsoid);
    if (cartesian) {
      const cartographic = ellipsoid.cartesianToCartographic(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      action(event, { lat, lng });
    }
  };
}

export default PluginCesium;
