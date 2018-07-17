import { replace } from '../../helpers';

const CanvasLayer = L.GridLayer.extend({
  tiles: {},

  createTile({ x, y, z }, done) {
    const { tileId, tileParams } = this.options;
    const id = replace(tileId, { x, y, z, ...tileParams });

    // Delete all tiles from others zooms;
    const tilesKeys = Object.keys(this.tiles);
    for (let i = 0; i < tilesKeys.length; i++) {
      if (this.tiles[tilesKeys[i]].z !== z) {
        delete this.tiles[tilesKeys[i]];
      }
    }

    // create a <canvas> element for drawing
    this.done = done;

    const tile = L.DomUtil.create('canvas', 'leaflet-tile');
    const ctx = tile.getContext('2d');
    const size = this.getTileSize();

    // setup tile width and height according to the options
    tile.width = size.x;
    tile.height = size.y;

    // getTile
    this.getTile({ x, y, z })
      .then((image) => {
        this.cacheTile({ id, tile, ctx, image, ...{ x, y, z } });
        this.drawCanvas(id);

        // return the tile so it can be rendered on screen
        done(null, tile);
      })
      .catch((err) => {
        done(err, tile);
      });

    return tile;
  },

  getTile({ x, y, z }) {
    const { tileId, tileParams } = this.options;
    const { url, dataMaxZoom } = tileParams;
    const zsteps = z - dataMaxZoom;
    const id = replace(tileId, { x, y, z, tileParams });

    let coords = { x, y, z };

    if (zsteps > 0) {
      coords = {
        x: Math.floor(x / (2 ** zsteps)),
        y: Math.floor(y / (2 ** zsteps)),
        z: dataMaxZoom
      };
    }

    const tileUrl = replace(url, { ...coords, ...tileParams });

    return new Promise((resolve, reject) => {
      // Return cached tile if loaded.
      if (this.tiles[id]) {
        resolve(this.tiles[id].image);
      }

      const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', (e) => {
        const { response } = e.currentTarget;
        const src = URL.createObjectURL(response);
        const image = new Image();

        image.src = src;

        image.onload = () => {
          image.crossOrigin = '';
          resolve(image);
          URL.revokeObjectURL(src);
        };

        image.onerror = () => {
          reject(new Error('Can\'t load image'));
        };
      });

      xhr.addEventListener('error', reject);

      xhr.open('GET', tileUrl, true);
      xhr.responseType = 'blob';
      xhr.send();
    });
  },

  cacheTile(tile) {
    this.tiles[tile.id] = {
      ...this.tiles[tile.id],
      ...tile
    };
  },

  drawCanvas(id) {
    if (!this.tiles[id]) {
      return;
    }

    const { tile, ctx, image, x, y, z } = this.tiles[id];

    if (!tile || !ctx || !image || !x || !y || !z) {
      delete this.tiles[id];
      return;
    }

    const { decodeParams, decodeFunction, tileParams } = this.options;
    const { dataMaxZoom } = tileParams;
    const zsteps = z - dataMaxZoom;

    // this will allow us to sum up the dots when the timeline is running
    ctx.clearRect(0, 0, tile.width, tile.width);

    if (zsteps < 0) {
      ctx.drawImage(image, 0, 0);
    } else {
      // over the maxzoom, we'll need to scale up each tile
      ctx.imageSmoothingEnabled = false;
      // disable pic enhancement
      ctx.mozImageSmoothingEnabled = false;

      // tile scaling
      const srcX = ((tile.width / (2 ** zsteps)) * (x % (2 ** zsteps))) || 0;
      const srcY = ((tile.height / (2 ** zsteps)) * (y % (2 ** zsteps))) || 0;
      const srcW = (tile.width / (2 ** zsteps)) || 0;
      const srcH = (tile.height / (2 ** zsteps)) || 0;

      ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, tile.width, tile.height);
    }

    const I = ctx.getImageData(0, 0, tile.width, tile.height);

    if (typeof decodeFunction === 'function') {
      decodeFunction(I.data, tile.width, tile.height, z, decodeParams);
    }

    ctx.putImageData(I, 0, 0);
  },

  reDraw(options) {
    this.options.tileId = options.tileId;
    this.options.tileParams = options.tileParams;
    this.options.decodeParams = options.decodeParams;

    const { tileId, tileParams } = options;

    Object.keys(this.tiles).map((k) => {
      const { x, y, z } = this.tiles[k];
      const id = replace(tileId, { x, y, z, ...tileParams });

      return this.getTile({ x, y, z })
        .then((image) => {
          this.cacheTile({ ...this.tiles[k], id, image, ...{ x, y, z } });
          this.drawCanvas(id);
        });
    });
  }
});


export default CanvasLayer;
