'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ref = typeof window !== 'undefined' ? window : {},
    L = _ref.L;

var UTFGridLayer = L && L.GridLayer.extend({
  tiles: {},
  cache: {},
  mouseOn: null,
  createTile: function createTile(_ref2) {
    var z = _ref2.z;

    // Delete all tiles from others zooms;
    var tilesKeys = Object.keys(this.tiles);
    for (var i = 0; i < tilesKeys.length; i++) {
      if (this.tiles[tilesKeys[i]].z !== z) {
        delete this.tiles[tilesKeys[i]];
      }
    }

    var tile = L.DomUtil.create('div', 'leaflet-tile');
    var size = this.getTileSize();

    // setup tile width and height according to the options
    tile.width = size.x;
    tile.height = size.y;

    return tile;
  },
  onAdd: function onAdd(map) {
    // Very important line
    L.GridLayer.prototype.onAdd.call(this, map);

    this.map = map;

    var zoom = Math.round(this.map.getZoom());

    if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
      return;
    }

    map.on('click', this.click, this);
    map.on('mousemove', this.move, this);
  },
  onRemove: function onRemove() {
    var map = this.map;

    map.off('click', this.click, this);
    map.off('mousemove', this.move, this);
  },
  click: function click(e) {
    this.fire('click', this.objectForEvent(e));
  },
  move: function move(e) {
    var on = this.objectForEvent(e);

    if (on.data !== this.mouseOn) {
      if (this.mouseOn) {
        this.fire('mouseout', { latlng: e.latlng, data: this.mouseOn });
      }
      if (on.data) {
        this.fire('mouseover', on);
      }

      this.mouseOn = on.data;
    } else if (on.data) {
      this.fire('mousemove', on);
    }
  },
  objectForEvent: function objectForEvent(e) {
    return L.extend({ latlng: e.latlng, data: null }, e);
  }
});

exports.default = UTFGridLayer;