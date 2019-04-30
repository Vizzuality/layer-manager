'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _query = require('../../utils/query');

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var CanvasLayer = L && L.GridLayer.extend({
  tiles: {},
  createTile: function createTile(_ref2, done) {
    var _this = this;

    var x = _ref2.x,
        y = _ref2.y,
        z = _ref2.z;
    var params = this.options.params;


    var id = (0, _query.replace)(params.url, Object.assign({ x: x, y: y, z: z }, params));

    // Delete all tiles from others zooms;
    var tilesKeys = Object.keys(this.tiles);
    for (var i = 0; i < tilesKeys.length; i++) {
      if (this.tiles[tilesKeys[i]].z !== z) {
        delete this.tiles[tilesKeys[i]];
      }
    }

    // create a <canvas> element for drawing
    this.done = done;

    var tile = L.DomUtil.create('canvas', 'leaflet-tile');
    var ctx = tile.getContext('2d');
    var size = this.getTileSize();

    // setup tile width and height according to the options
    tile.width = size.x;
    tile.height = size.y;

    // getTile
    this.getTile({ x: x, y: y, z: z }).then(function (image) {
      _this.cacheTile(Object.assign({ id: id, tile: tile, ctx: ctx, image: image }, { x: x, y: y, z: z }));
      _this.drawCanvas(id);

      // return the tile so it can be rendered on screen
      done(null, tile);
    }).catch(function (err) {
      done(err, tile);
    });

    return tile;
  },
  getTile: function getTile(_ref3) {
    var _this2 = this;

    var x = _ref3.x,
        y = _ref3.y,
        z = _ref3.z;
    var _options = this.options,
        params = _options.params,
        sqlParams = _options.sqlParams;
    var url = params.url,
        _params$dataMaxZoom = params.dataMaxZoom,
        dataMaxZoom = _params$dataMaxZoom === undefined ? 20 : _params$dataMaxZoom;

    var zsteps = z - dataMaxZoom;
    var id = (0, _query.replace)(params.url, Object.assign({ x: x, y: y, z: z }, params));

    var coords = { x: x, y: y, z: z };

    if (zsteps > 0) {
      coords = {
        x: Math.floor(x / Math.pow(2, zsteps)),
        y: Math.floor(y / Math.pow(2, zsteps)),
        z: dataMaxZoom
      };
    }

    var tileUrl = (0, _query.replace)(url, Object.assign({}, coords, params), sqlParams);

    return new Promise(function (resolve, reject) {
      // Return cached tile if loaded.
      if (_this2.tiles[id]) {
        resolve(_this2.tiles[id].image);
      }

      var xhr = new XMLHttpRequest();

      xhr.addEventListener('load', function (e) {
        var response = e.currentTarget.response;

        var src = URL.createObjectURL(response);
        var image = new Image();

        image.src = src;

        image.onload = function () {
          image.crossOrigin = '';
          resolve(image);
          URL.revokeObjectURL(src);
        };

        image.onerror = function () {
          reject(new Error("Can't load image"));
        };
      });

      xhr.addEventListener('error', reject);

      xhr.open('GET', tileUrl, true);
      xhr.responseType = 'blob';
      xhr.send();
    });
  },
  cacheTile: function cacheTile(tile) {
    this.tiles[tile.id] = Object.assign({}, this.tiles[tile.id], tile);
  },
  drawCanvas: function drawCanvas(id) {
    'use asm';

    if (!this.tiles[id]) {
      return;
    }

    var _tiles$id = this.tiles[id],
        tile = _tiles$id.tile,
        ctx = _tiles$id.ctx,
        image = _tiles$id.image,
        x = _tiles$id.x,
        y = _tiles$id.y,
        z = _tiles$id.z;


    if (!tile || !ctx || !image || typeof x === 'undefined' || typeof y === 'undefined' || typeof z === 'undefined') {
      delete this.tiles[id];
      return;
    }

    var _options2 = this.options,
        params = _options2.params,
        decodeParams = _options2.decodeParams,
        decodeFunction = _options2.decodeFunction;
    var _params$dataMaxZoom2 = params.dataMaxZoom,
        dataMaxZoom = _params$dataMaxZoom2 === undefined ? 20 : _params$dataMaxZoom2;

    var zsteps = z - dataMaxZoom;

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
      var srcX = tile.width / Math.pow(2, zsteps) * (x % Math.pow(2, zsteps)) || 0;
      var srcY = tile.height / Math.pow(2, zsteps) * (y % Math.pow(2, zsteps)) || 0;
      var srcW = tile.width / Math.pow(2, zsteps) || 0;
      var srcH = tile.height / Math.pow(2, zsteps) || 0;

      ctx.drawImage(image, srcX, srcY, srcW, srcH, 0, 0, tile.width, tile.height);
    }

    var I = ctx.getImageData(0, 0, tile.width, tile.height);

    if (typeof decodeFunction === 'function') {
      decodeFunction(I.data, tile.width, tile.height, z, decodeParams);
    }

    ctx.putImageData(I, 0, 0);
  },
  reDraw: function reDraw(options) {
    var _this3 = this;

    this.options.params = options.params;
    this.options.sqlParams = options.sqlParams;
    this.options.decodeParams = options.decodeParams;

    var params = options.params,
        sqlParams = options.sqlParams;


    if (params && params.url) {
      Object.keys(this.tiles).map(function (k) {
        var _tiles$k = _this3.tiles[k],
            x = _tiles$k.x,
            y = _tiles$k.y,
            z = _tiles$k.z;

        var id = (0, _query.replace)(params.url, Object.assign({ x: x, y: y, z: z }, params, { sqlParams: sqlParams }));

        return _this3.drawCanvas(id);
      });
    }
  }
});

exports.default = CanvasLayer;