import { replace } from '../../helpers';

const CanvasLayer = L.GridLayer.extend({
  tiles: [],

  createTile({ x, y, z }, done) {
    const tileId = replace('{x}_{y}_{z}', { x, y, z });

    // Delete all tiles from others zooms;
    const tilesKeys = Object.keys(this.tiles);
    for (let i = 0; i < tilesKeys.length; i++) {
      if (this.tiles[tilesKeys[i]].z !== z) {
        delete this.tiles[tilesKeys[i]];
      }
    }

    // create a <canvas> element for drawing
    const tile = L.DomUtil.create('canvas', 'leaflet-tile');
    const ctx = tile.getContext('2d');
    const size = this.getTileSize();

    // setup tile width and height according to the options
    tile.width = size.x;
    tile.height = size.y;

    // getTile
    this.getTile({ x, y, z })
      .then((image) => {
        this.cacheTile({ image, tileId });
        this.drawCanvas({ ctx, tile, image, z, x, y, done });

        // return the tile so it can be rendered on screen
        done(null, tile);
      })
      .catch((err) => {
        done(err, tile);
      });

    return tile;
  },

  getTile({ z, x, y }) {
    const { url, options } = this.options;
    const zsteps = z - options.dataMaxZoom;
    const tileId = replace('{x}_{y}_{z}', { x, y, z });

    let coords = { x, y, z };

    if (zsteps > 0) {
      coords = {
        x: Math.floor(x / (2 ** zsteps)),
        y: Math.floor(y / (2 ** zsteps)),
        z: options.dataMaxZoom
      };
    }

    const tileUrl = replace(url, { ...coords, thresh: options.threshold });

    return new Promise((resolve, reject) => {
      // Return cached tile if loaded.
      if (this.tiles[tileId]) {
        resolve(this.tiles[tileId].image);
      }

      const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', (e) => {
        const { response } = e.currentTarget;
        const src = URL.createObjectURL(response);
        const image = new Image();

        image.onload = () => {
          image.crossOrigin = '';
          resolve(image);
          URL.revokeObjectURL(src);
        };

        image.onerror = () => {
          reject(new Error('Can\'t load image'));
        };

        image.src = src;
      });

      xhr.addEventListener('error', reject);

      xhr.open('GET', tileUrl, true);
      xhr.responseType = 'blob';
      xhr.send();
    });
  },

  cacheTile({ image, tileId }) {
    this.tiles[tileId] = image;
  },

  drawCanvas({ ctx, tile, image, z, x, y }) {
    const { options, decodeFunction } = this.options;
    const zsteps = z - options.dataMaxZoom;

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
      decodeFunction(I.data, tile.width, tile.height, z);
    }

    ctx.putImageData(I, 0, 0);
  }

});


export default CanvasLayer;
