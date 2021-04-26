/* eslint-disable no-underscore-dangle */
import sortBy from 'lodash/sortBy';

import rasterLayer from './raster-layer-mapbox-gl';
import vectorLayer from './vector-layer-mapbox-gl';
import geoJsonLayer from './geojson-layer-mapbox-gl';
import videoLayer from './video-layer-mapbox-gl';

class PluginMapboxGL {
  constructor(map, options) {
    this.map = map;
    this.options = options;

    // You can change mapStyles and all the layers will be repositioned
    this.map.on('style.load', () => {
      const layers = this.getLayers();

      layers.forEach(layer => this.add(layer));
    });
  }

  type = {
    raster: rasterLayer,
    vector: vectorLayer,
    geojson: geoJsonLayer,
    video: videoLayer
  };

  /**
   * Add a layer
   * @param {Object} layerModel
   */
  add(layerModel) {
    const { images, mapLayer } = layerModel;
    const allLayers = this.getLayers();

    if (Array.isArray(images)) {
      images.forEach(({ id, src, options }) => {
        if (!this.map.hasImage(id)) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            this.map.addImage(id, img, options);
          };
        }
      });
    }

    // add source if it has one
    if (
      this.map &&
      mapLayer &&
      mapLayer.source &&
      mapLayer.id &&
      !this.map.getSource(mapLayer.id)
    ) {
      this.map.addSource(mapLayer.id, mapLayer.source);
    }

    // add layers
    if (mapLayer && mapLayer.layers) {
      mapLayer.layers.forEach(l => {
        const { metadata = {} } = l;
        const nextLayerId = metadata.position === 'top' ? null : this.getNextLayerId(layerModel);

        if (this.map && !this.map.getLayer(l.id)) {
          this.map.addLayer(l, nextLayerId);
        }

        allLayers.forEach(() => {
          this.setZIndex();
        });
      });
    }
  }

  /**
   * Remove a layer
   * @param {Object} layerModel
   */
  remove(layerModel = {}) {
    const { mapLayer } = layerModel;
    if (mapLayer && mapLayer.layers && this.map && this.map.style) {
      mapLayer.layers.forEach(l => {
        if (this.map.getLayer(l.id)) {
          this.map.removeLayer(l.id);
        }
      });
    }

    if (mapLayer && !!this.map && this.map.getSource(mapLayer.id)) {
      this.map.removeSource(mapLayer.id);
    }
  }

  /**
   * Get method by type
   * @param {String} type
   */
  getLayerByType(type) {
    return this.type[type];
  }

  /**
   * Get all mapbox layers
   */
  getLayersOnMap() {
    return this.map.getStyle().layers;
  }

  getLayer(layerModel) {
    const { mapLayer } = layerModel;

    if (this.map) {
      return this.map.getSource(mapLayer.id);
    }

    return null;
  }

  /**
   * Get all layers passed to layer manager
   */
  getLayers() {
    const { getLayers } = this.options;
    const layers = getLayers();
    return sortBy(layers, l => l.decodeFunction);
  }

  /**
   * Get the layer above the given z-index
   * @param {Object} layerModel
   */
  getNextLayerId(layerModel) {
    const { zIndex } = layerModel;
    const allLayers = this.getLayers();
    const layersOnMap = this.getLayersOnMap();

    // find the top layer for placing data layers below
    const customLayer =
      layersOnMap &&
      layersOnMap.length &&
      layersOnMap.find(
        l =>
          l.id.includes('custom-layers') ||
          l.id.includes('label') ||
          l.id.includes('place') ||
          l.id.includes('poi')
      );

    // make sure layers are sorted by zIndex
    const sortedLayers = sortBy(allLayers, l => l.zIndex);

    // get the layer with zIndex greater than current layer from all layers
    const nextLayer = sortedLayers.find(
      l =>
        l.zIndex > zIndex &&
        (!l.mapLayer ||
          !l.mapLayer.layers ||
          !l.mapLayer.layers[0] ||
          !l.mapLayer.layers[0].metadata ||
          !l.mapLayer.layers[0].metadata.position)
    );

    // if no layer above it then use the custom layer
    if (!nextLayer || (!!nextLayer && !nextLayer.mapLayer)) {
      return customLayer.id;
    }

    // get the first layer of the next layer's array
    const nextLayerMapLayers = nextLayer.mapLayer.layers;
    const nextLayerMapLayer = nextLayerMapLayers[0];

    // Filter layers with custom metadata position
    const { id } = nextLayerMapLayer;

    // if it has a layer above it, check if that layer has been added to the map and get its id
    const isNextLayerOnMap = !!layersOnMap.find(l => id === l.id);

    // if next layer is on map return the id, else return the custom layer to add below
    return isNextLayerOnMap ? id : customLayer.id;
  }

  /**
   * A namespace to set z-index
   * @param {Object} layerModel
   */
  setZIndex() {
    const allLayers = this.getLayers();
    const layersOnMap = this.getLayersOnMap();

    // set zIndex for all layers currently on map
    layersOnMap.forEach(l => {
      const { id, metadata = {} } = l;
      const layerModel = allLayers.find(ly => id.includes(ly.id));

      if (layerModel) {
        const nextLayerId = metadata.position === 'top' ? null : this.getNextLayerId(layerModel);
        this.map.moveLayer(id, nextLayerId);
      }
    });

    // set for all decode layers that don't exist inside mapStyle()
    const decodeLayers = allLayers.filter(l => !!l.decodeFunction);

    if (decodeLayers && this.map) {
      decodeLayers.forEach(layerModel => {
        const { mapLayer } = layerModel;

        if (mapLayer) {
          const { layers } = mapLayer;
          const parentLayer = layers[0];
          const childLayer = layers[1];

          const parentLayerOnMap = layersOnMap.find(ly => ly.id === parentLayer.id);
          const childLayerOnMap = this.map.getLayer(childLayer.id);

          if (parentLayerOnMap && childLayerOnMap) {
            this.map.moveLayer(childLayer.id, parentLayer.id);
          }
        }
      });
    }

    return true;
  }

  /**
   * Given a desired value to give to a paint property of a layer, this function will return the
   * correct value to set, by taking into account other factors such as the opacity of the layer
   * @param {object} layerModel LayerModel instance
   * @param {string} layerId ID of the layer that contains the property
   * @param {string} propertyName Name of the property to set
   * @param {any} desiredValue Value to give the property
   */
  // eslint-disable-next-line class-methods-use-this
  computePaintPropertyValue(layerModel, layerId, propertyName, desiredValue) {
    const {
      opacity,
      render: { layers = [] },
      mapLayer
    } = layerModel;
    const isOpacityProperty = /-opacity$/.test(propertyName);

    // The opacity of the layer isn't relevant for this property
    if (!isOpacityProperty) {
      return desiredValue;
    }

    const { paint = {} } =
      layers.find((layer, index) => {
        if (layer.id === undefined || layer.id === null) {
          return `${mapLayer.id}-${layer.type}-${index}` === layerId;
        }

        return layer.id === layerId;
      }) || {};
    const currentValue = paint[propertyName];

    let res = 0.99 * opacity;

    if (currentValue !== undefined && currentValue !== null) {
      if (typeof currentValue === 'number') {
        res = currentValue * opacity * 0.99;
      } else if (Array.isArray(currentValue)) {
        res = currentValue.map(element =>
          typeof element === 'number' ? element * opacity * 0.99 : element
        );
      }
    }

    return res;
  }

  /**
   * A namespace to set opacity
   * @param {Object} layerModel
   * @param {Number} opacity
   */
  setOpacity(layerModel, opacity) {
    const PAINT_STYLE_NAMES = {
      symbol: ['icon', 'text'],
      circle: ['circle', 'circle-stroke']
    };

    const { mapLayer, decodeFunction } = layerModel;

    if (mapLayer.layers && !decodeFunction) {
      mapLayer.layers.forEach(l => {
        // Select the style to change depending on the type of layer
        const paintStyleNames = PAINT_STYLE_NAMES[l.type] || [l.type];

        // Loop each style name and check if there is an opacity in the original layer
        paintStyleNames.forEach(name => {
          const propertyName = `${name}-opacity`;
          const propertyValue = this.computePaintPropertyValue(
            layerModel,
            l.id,
            propertyName,
            opacity
          );

          this.map.setPaintProperty(l.id, propertyName, propertyValue);
        });
      });
    }

    if (decodeFunction) {
      const layer = mapLayer.layers[1];

      if (layer && typeof layer.setProps === 'function') {
        layer.setProps({ opacity });
      }
    }
  }

  /**
   * A namespace to hide or show a selected layer
   * @param {Object} layerModel
   * @param {Boolean} visibility
   */
  setVisibility(layerModel, visibility) {
    const { mapLayer } = layerModel;

    if (mapLayer && mapLayer.layers && this.map && this.map.style) {
      mapLayer.layers.forEach(l => {
        this.map.setLayoutProperty(l.id, 'visibility', visibility ? 'visible' : 'none');
      });
    }
  }

  setSource(layerModel) {
    const { id, source } = layerModel;
    const { type, data } = source;

    if (this.map && type === 'geojson' && !!data && typeof data !== 'string') {
      const src = this.map.getSource(id);
      src.setData(data);
    }
    return this;
  }

  setRender(layerModel) {
    const { mapLayer, render } = layerModel;
    const { layers: renderLayers = [] } = render;

    if (!mapLayer || !renderLayers.length) {
      return this;
    }

    try {
      mapLayer.layers.forEach((layer, i) => {
        const { id } = layer;
        const rl = renderLayers[i] || renderLayers[0] || {}; // take the style for each layer or use the first one for all of them
        const { paint = {}, layout = {}, filter = null } = rl;

        this.map.setFilter(id, filter);

        Object.keys(paint).forEach(p => {
          this.map.setPaintProperty(
            id,
            p,
            this.computePaintPropertyValue(layerModel, id, p, paint[p])
          );
        });

        Object.keys(layout).forEach(l => {
          this.map.setLayoutProperty(id, l, layout[l]);
        });
      });
    } catch (error) {
      console.error(error);
    }

    // NOT COMPATIBLE WITH REACT MAP GL
    // if (true) {
    //   document.querySelector('.overlays').style = 'pointer-events: none;'

    //   mapLayer.layers.forEach((layer) => {
    //     const { id, source, 'source-layer': sourceLayer } = layer;

    //     // When the user moves their mouse over the state-fill layer, we'll update the
    //     // feature state for the feature under the mouse.
    //     this.map.off('mousemove', id);
    //     this.map.on('mousemove', id, (e) => {
    //       const { hoverId } = layerModel;

    //       if (e.features.length > 0) {
    //         layerModel.set('hoverId', e.features[0].id);

    //         if (hoverId) {
    //           this.map.setFeatureState({
    //             source,
    //             ...sourceLayer && { sourceLayer },
    //             id: hoverId
    //           }, { hover: false });
    //         }

    //         this.map.setFeatureState({
    //           source,
    //           ...sourceLayer && { sourceLayer },
    //           id: e.features[0].id
    //         }, { hover: true });
    //       }
    //     });

    //     // When the mouse leaves the state-fill layer, update the feature state of the
    //     // previously hovered feature.
    //     this.map.off('mouseleave', id);
    //     this.map.on('mouseleave', id, () => {
    //       const { hoverId } = layerModel;

    //       if (hoverId) {
    //         this.map.setFeatureState({
    //           source,
    //           ...layer['source-layer'] && { 'sourceLayer': layer['source-layer'] },
    //           id: hoverId
    //         }, { hover: false });
    //       }
    //       layerModel.set('hoverId', null);
    //     });
    //   })
    // }
    return this;
  }

  setParams() {
    return this;
  }

  setSQLParams() {
    return this;
  }

  setDecodeParams(layerModel) {
    const { mapLayer, decodeParams } = layerModel;

    if (!mapLayer) {
      return this;
    }

    const layer = mapLayer.layers[1];

    if (layer && typeof layer.setProps === 'function') {
      layer.setProps({ decodeParams });
    } else {
      console.error(
        "Layer is not present. You defined decodeParams but maybe you didn't define a decodeFunction"
      );
    }

    return this;
  }

  unmount() {
    this.map = null;
  }
}

export default PluginMapboxGL;
