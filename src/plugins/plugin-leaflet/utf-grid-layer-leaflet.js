const { L } = typeof window !== 'undefined' ? window : {};

const UTFGridLayer = L && L.GridLayer.extend({
    tiles: {},
    cache: {},
    mouseOn: null,
    createTile({ z }) {
      // Delete all tiles from others zooms;
      const tilesKeys = Object.keys(this.tiles);
      for (let i = 0; i < tilesKeys.length; i++) {
        if (this.tiles[tilesKeys[i]].z !== z) {
          delete this.tiles[tilesKeys[i]];
        }
      }

      const tile = L.DomUtil.create('div', 'leaflet-tile');
      const size = this.getTileSize();

      // setup tile width and height according to the options
      tile.width = size.x;
      tile.height = size.y;

      return tile;
    },
    onAdd(map) {
      // Very important line
      L.GridLayer.prototype.onAdd.call(this, map);

      this.map = map;

      const zoom = Math.round(this.map.getZoom());

      if (zoom > this.options.maxZoom || zoom < this.options.minZoom) {
        return;
      }

      map.on('click', this.click, this);
      map.on('mousemove', this.move, this);
    },
    onRemove() {
      const { map } = this;
      map.off('click', this.click, this);
      map.off('mousemove', this.move, this);
    },
    click(e) {
      this.fire('click', this.objectForEvent(e));
    },
    move(e) {
      const on = this.objectForEvent(e);

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
    objectForEvent(e) {
      return L.extend({ latlng: e.latlng, data: null }, e);
    },
  });

export default UTFGridLayer;
