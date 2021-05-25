/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable class-methods-use-this */
import Tile from './tile';
import { getTileIndices } from './viewport-util';

/**
 * Manages loading and purging of tiles data. This class caches recently visited tiles
 * and only create new tiles if they are present.
 */

export default class TileCache {
  /**
   * Takes in a function that returns tile data, a cache size, and a max and a min zoom level.
   * Cache size defaults to 5 * number of tiles in the current viewport
   */
  constructor({
    getTileData, maxSize, maxZoom, minZoom, onTileLoad, onTileError,
  }) {
    // TODO: Instead of hardcode size, we should calculate how much memory left
    this._getTileData = getTileData;
    this._maxSize = maxSize;
    this.onTileError = onTileError;
    this.onTileLoad = onTileLoad;

    // Maps tile id in string {z}-{x}-{y} to a Tile object
    this._cache = new Map();
    this._tiles = [];

    if (Number.isFinite(maxZoom)) {
      this._maxZoom = Math.floor(maxZoom);
    }
    if (Number.isFinite(minZoom)) {
      this._minZoom = Math.ceil(minZoom);
    }
  }

  get tiles() {
    return this._tiles;
  }

  /**
   * Clear the current cache
   */
  finalize() {
    this._cache.clear();
  }

  /**
   * Update the cache with the given viewport and triggers callback onUpdate.
   * @param {*} viewport
   * @param {*} onUpdate
   */
  update(viewport) {
    const {
      _cache, _getTileData, _maxSize, _maxZoom, _minZoom,
    } = this;
    this._markOldTiles();
    const tileIndices = getTileIndices(viewport, _maxZoom, _minZoom);
    if (!tileIndices || tileIndices.length === 0) {
      return;
    }
    _cache.forEach((cachedTile) => {
      if (tileIndices.some((tile) => cachedTile.isOverlapped(tile))) {
        cachedTile.isVisible = true; // eslint-disable-line
      }
    });

    let changed = false;

    for (let i = 0; i < tileIndices.length; i += 1) {
      const tileIndex = tileIndices[i];

      const { x, y, z } = tileIndex;
      let tile = this._getTile(x, y, z);
      if (!tile) {
        tile = new Tile({
          getTileData: _getTileData,
          x,
          y,
          z,
          onTileLoad: this.onTileLoad,
          onTileError: this.onTileError,
        });
        tile.isVisible = true;
        changed = true;
      }
      const tileId = this._getTileId(x, y, z);
      _cache.set(tileId, tile);
    }

    if (changed) {
      // cache size is either the user defined
      // maxSize or 5 * number of current tiles in the viewport.
      const commonZoomRange = 5;
      this._resizeCache(_maxSize || commonZoomRange * tileIndices.length);
      this._tiles = Array.from(this._cache.values())
        // sort by zoom level so parents tiles don't show up when children tiles are rendered
        .sort((t1, t2) => t1.z - t2.z);
    }
  }

  /**
   * Clear tiles that are not visible when the cache is full
   */
  _resizeCache(maxSize) {
    const { _cache } = this;
    if (_cache.size > maxSize) {
      const iterator = _cache[Symbol.iterator]();

      // eslint-disable-next-line no-restricted-syntax
      for (const cachedTile of iterator) {
        if (_cache.size <= maxSize) {
          break;
        }
        const tileId = cachedTile[0];
        const tile = cachedTile[1];
        if (!tile.isVisible) {
          _cache.delete(tileId);
        }
      }
    }
  }

  _markOldTiles() {
    this._cache.forEach((cachedTile) => {
      // eslint-disable-next-line no-param-reassign
      cachedTile.isVisible = false;
    });
  }

  _getTile(x, y, z) {
    const tileId = this._getTileId(x, y, z);
    return this._cache.get(tileId);
  }

  _getTileId(x, y, z) {
    return `${z}-${x}-${y}`;
  }
}
