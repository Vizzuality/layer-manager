import buildCartoLayerCesium from './carto-layer-cesium';

class PluginCesium {
  static Cesium = window.Cesium;
  constructor(map) {
    const { Cesium } = PluginCesium;
    this.map = map;
    this.eventListener = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);
    this.method = {
      carto: buildCartoLayerCesium(Cesium),
      cartodb: buildCartoLayerCesium(Cesium)
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
    // eslint-disable-next-line
    const nextIndex = zIndex < 0 ? 0 : (zIndex >= length ? length - 1 : zIndex); // sorry not sorry
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
  }

  setOpacity(layerModel, opacity) {
    const { mapLayer } = layerModel;
    mapLayer.alpha = opacity;
  }

  setVisibility(layerModel, visibility) {
    const { mapLayer } = layerModel;
    mapLayer.show = visibility;
  }

  setEvents(layerModel) {
    const { events } = layerModel;
    Object.keys(events).forEach((type) => {
      const action = events[type];
      if (this.eventListener.getInputAction(type)) {
        this.eventListener.removeInputAction(type);
      }
      this.eventListener.setInputAction(this.getCoordinatesFromEvent(action), type);
    });
  }

  getCoordinatesFromEvent = action => (event) => {
    const { position } = event;
    const { Cesium } = PluginCesium;
    const clicked = new Cesium.Cartesian2(position.x, position.y);
    const { ellipsoid } = this.map.scene.globe;
    const cartesian = this.map.camera.pickEllipsoid(clicked, ellipsoid);
    if (cartesian) {
      const cartographic = ellipsoid.cartesianToCartographic(cartesian);
      const lat = Cesium.Math.toDegrees(cartographic.longitude);
      const lng = Cesium.Math.toDegrees(cartographic.latitude);
      action({ lat, lng }, event);
    }
  }
}

export default PluginCesium;
