/* eslint-disable no-param-reassign,no-restricted-properties,class-methods-use-this,no-underscore-dangle */
import { CompositeLayer } from '@deck.gl/core';
import TileCache from './utils/tile-cache';

const defaultProps = {
  renderSubLayers: { type: 'function', value: () => null },
  getTileData: { type: 'function', value: () => Promise.resolve(null) },
  // TODO - change to onViewportLoad to align with Tile3DLayer
  onViewportLoaded: { type: 'function', optional: true, value: null },
  // eslint-disable-next-line
  onTileError: { type: 'function', value: err => console.error(err) },
  maxZoom: null,
  minZoom: 0,
  maxCacheSize: null,
};

export default class TileLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      tiles: [],
      isLoaded: false,
    };
  }

  shouldUpdateState({ changeFlags }) {
    return changeFlags.somethingChanged;
  }

  updateState({ props, context, changeFlags }) {
    let { tileCache } = this.state;
    if (
      !tileCache
      || (changeFlags.updateTriggersChanged
        && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getTileData))
    ) {
      const {
        getTileData, maxZoom, minZoom, maxCacheSize,
      } = props;
      if (tileCache) {
        tileCache.finalize();
      }
      tileCache = new TileCache({
        getTileData,
        maxSize: maxCacheSize,
        maxZoom,
        minZoom,
        onTileLoad: this._onTileLoad.bind(this),
        onTileError: this._onTileError.bind(this),
      });

      this.setState({ tileCache });
    } else if (changeFlags.updateTriggersChanged) {
      // if any updateTriggersChanged (other than getTileData), delete the layer
      this.state.tileCache.tiles.forEach((tile) => {
        tile.layer = null;
      });
    }

    const { viewport } = context;
    if (changeFlags.viewportChanged && viewport.id !== 'DEFAULT-INITIAL-VIEWPORT') {
      const z = this.getLayerZoomLevel();
      tileCache.update(viewport);
      // The tiles that should be displayed at this zoom level
      const currTiles = tileCache.tiles.filter((tile) => tile.z === z);
      this.setState({ isLoaded: false, tiles: currTiles });
      this._onTileLoad();
    }
  }

  _onTileLoad() {
    const { onViewportLoaded } = this.props;
    const currTiles = this.state.tiles;
    const allCurrTilesLoaded = currTiles.every((tile) => tile.isLoaded);

    if (this.state.isLoaded !== allCurrTilesLoaded) {
      this.setState({ isLoaded: allCurrTilesLoaded });
      if (allCurrTilesLoaded && onViewportLoaded) {
        onViewportLoaded(currTiles.filter((tile) => tile._data).map((tile) => tile._data));
      }
    }
  }

  _onTileError(error) {
    this.props.onTileError(error);
    // errorred tiles should not block rendering, are considered "loaded" with empty data
    this._onTileLoad();
  }

  getPickingInfo({ info, sourceLayer }) {
    info.sourceLayer = sourceLayer;
    info.tile = sourceLayer.props.tile;
    return info;
  }

  getLayerZoomLevel() {
    const z = Math.floor(this.context.viewport.zoom) + 1;
    const { maxZoom, minZoom } = this.props;
    if (Number.isFinite(maxZoom) && z > maxZoom) {
      return Math.floor(maxZoom);
    }

    if (Number.isFinite(minZoom) && z < minZoom) {
      return Math.ceil(minZoom);
    }
    return z;
  }

  renderLayers() {
    const {
      visible, opacity, decodeParams, renderSubLayers,
    } = this.props;
    const z = this.getLayerZoomLevel();

    return this.state.tiles.map((tile) => {
      // For a tile to be visible:
      // - parent layer must be visible
      // - tile must be visible in the current viewport
      // - if all tiles are loaded, only display the tiles from the current z level
      const isVisible = visible && tile.isVisible && (!this.state.isLoaded || tile.z === z);

      // cache the rendered layer in the tile
      if (!tile.layer) {
        // I have an error when I try this condition. I think is related to return the same tile.layer
        // https://github.com/uber/deck.gl/blob/c616dbfbcbdc9d8533b88ba8a142c5527764bbd8/modules/core/src/lib/layer-manager.js#L67-L70
        tile.layer = renderSubLayers({
          ...this.props,
          id: `${this.id}-${tile.x}-${tile.y}-${tile.z}`,
          data: tile.data,
          visible: isVisible,
          opacity,
          tile,
          zoom: z,
        });
      } else if (tile.layer.props.visible !== isVisible) {
        tile.layer = tile.layer.clone({
          visible: isVisible,
        });
      } else if (tile.layer.props.opacity !== opacity) {
        tile.layer = tile.layer.clone({
          opacity,
        });
      } else if (tile.layer.props.decodeParams) {
        tile.layer = tile.layer.clone({
          decodeParams,
        });
      }
      return tile.layer;
    });
  }
}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
