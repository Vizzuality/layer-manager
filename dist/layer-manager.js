(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios'), require('lodash/compact'), require('lodash/isEqual'), require('lodash/isEmpty')) :
  typeof define === 'function' && define.amd ? define(['axios', 'lodash/compact', 'lodash/isEqual', 'lodash/isEmpty'], factory) :
  (global.LayerManager = factory(global.axios,global.compact,global.isEqual,global.isEmpty));
}(this, (function (axios,compact,isEqual,isEmpty) { 'use strict';

  var axios__default = 'default' in axios ? axios['default'] : axios;
  compact = compact && compact.hasOwnProperty('default') ? compact['default'] : compact;
  isEqual = isEqual && isEqual.hasOwnProperty('default') ? isEqual['default'] : isEqual;
  isEmpty = isEmpty && isEmpty.hasOwnProperty('default') ? isEmpty['default'] : isEmpty;

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var defineProperty = function (obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  };

  var _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  var headers = {
    'Content-Type': 'application/json'
  };

  var get$1 = function get$$1(url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return axios__default.get(url, _extends({
      headers: headers
    }, options));
  };

  /**
   * Params should have this format => { key:'xxx', key2:'xxx' }
   * Keys to search should be in this format {{key}}
   * @param {String} originalStr
   * @param {Object} params
   */
  var substitution = function substitution(originalStr) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var str = originalStr;
    Object.keys(params).forEach(function (key) {
      str = str.replace(new RegExp('{{' + key + '}}', 'g'), params[key]).replace(new RegExp('{' + key + '}', 'g'), params[key]);
    });
    return str;
  };

  /**
   * Params should have this format => { where1: { { key:'xxx', key2:'xxx' } }},
   * Keys to search should be in this format {{key}}
   * @param {String} originalStr
   * @param {Object} params
   */
  var concatenation = function concatenation(originalStr) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var str = originalStr;
    var sql = void 0;

    Object.keys(params).forEach(function (key) {
      sql = '' + compact(Object.keys(params[key]).map(function (k) {
        var value = params[key][k];

        if (Array.isArray(value) && !!value.length) {
          var mappedValue = value.map(function (v) {
            return typeof v !== 'number' ? '\'' + v + '\'' : v;
          });
          return k + ' IN (' + mappedValue.join(', ') + ')';
        }

        if (!Array.isArray(value) && value) {
          return typeof value !== 'number' ? k + ' = \'' + value + '\'' : k + ' = ' + value;
        }

        return null;
      })).join(' AND ');

      if (sql && key.startsWith('where')) sql = 'WHERE ' + sql;else if (sql && key.startsWith('and')) sql = 'AND ' + sql;else sql = '';

      str = str.replace(new RegExp('{{' + key + '}}', 'g'), sql);
      str = str.replace(new RegExp('{' + key + '}', 'g'), sql);
    });

    return str;
  };

  /**
   * Replace function
   * @param {String} string
   * @param {Object} params
   * @param {Object} sqlParams
   */
  var replace = function replace(originalStr) {
    var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var sqlParams = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var str = originalStr;

    if (typeof str === 'string') {
      str = substitution(str, params);
      str = concatenation(str, sqlParams);
    }

    return str;
  };

  var fetchTile = function fetchTile(layerModel) {
    var layerConfig = layerModel.layerConfig,
        params = layerModel.params,
        sqlParams = layerModel.sqlParams,
        interactivity = layerModel.interactivity;


    var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
    var layerTpl = JSON.stringify({
      version: '1.3.0',
      stat_tag: 'API',
      layers: layerConfigParsed.body.layers.map(function (l) {
        if (!!interactivity && interactivity.length) {
          return _extends({}, l, { options: _extends({}, l.options, { interactivity: interactivity.split(', ') }) });
        }
        return l;
      })
    });
    var apiParams = '?stat_tag=API&config=' + encodeURIComponent(layerTpl);
    var url = 'https://' + layerConfigParsed.account + '-cdn.resilienceatlas.org/user/ra/api/v1/map' + apiParams;

    var layerRequest = layerModel.layerRequest;

    if (layerRequest) {
      layerRequest.cancel('Operation canceled by the user.');
    }

    var layerRequestSource = axios.CancelToken.source();
    layerModel.set('layerRequest', layerRequestSource);

    var newLayerRequest = get$1(url, { cancelToken: layerRequestSource.token }).then(function (res) {
      if (res.status > 400) {
        console.error(res);
        return false;
      }

      return res.data;
    });

    return newLayerRequest;
  };

  var _ref = typeof window !== 'undefined' ? window : {},
      L = _ref.L;

  var CartoLayer = function CartoLayer(layerModel) {
    if (!L) throw new Error('Leaflet must be defined.');

    var layerConfig = layerModel.layerConfig,
        params = layerModel.params,
        sqlParams = layerModel.sqlParams,
        interactivity = layerModel.interactivity;

    var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

    return new Promise(function (resolve, reject) {
      fetchTile(layerModel).then(function (response) {
        var tileUrl = 'https://' + response.cdn_url.https + '/ra/api/v1/map/' + response.layergroupid + '/{z}/{x}/{y}.png';
        var layer = L.tileLayer(tileUrl);

        // Add interactivity
        // if (interactivity && interactivity.length) {
        //   const gridUrl = `https://${layerConfigParsed.account}-cdn.resilienceatlas.org/user/ra/api/v1/map/${response.layergroupid}/0/{z}/{x}/{y}.grid.json`;
        //   const interactiveLayer = L.utfGrid(gridUrl);

        //   const LayerGroup = L.LayerGroup.extend({
        //     group: true,
        //     setOpacity: (opacity) => {
        //       layerModel.mapLayer.getLayers().forEach((l) => {
        //         l.setOpacity(opacity);
        //       });
        //     }
        //   });

        //   return resolve(new LayerGroup([layer, interactiveLayer]));
        // }

        return resolve(layer);
      }).catch(function (err) {
        return reject(err);
      });
    });
  };

  var _ref$1 = typeof window !== 'undefined' ? window : {},
      L$1 = _ref$1.L;

  var CanvasLayer = L$1 && L$1.GridLayer.extend({
    tiles: {},
    createTile: function createTile(_ref2, done) {
      var _this = this;

      var x = _ref2.x,
          y = _ref2.y,
          z = _ref2.z;
      var params = this.options.params;


      var id = replace(params.url, _extends({ x: x, y: y, z: z }, params));

      // Delete all tiles from others zooms;
      var tilesKeys = Object.keys(this.tiles);
      for (var i = 0; i < tilesKeys.length; i++) {
        if (this.tiles[tilesKeys[i]].z !== z) {
          delete this.tiles[tilesKeys[i]];
        }
      }

      // create a <canvas> element for drawing
      this.done = done;

      var tile = L$1.DomUtil.create('canvas', 'leaflet-tile');
      var ctx = tile.getContext('2d');
      var size = this.getTileSize();

      // setup tile width and height according to the options
      tile.width = size.x;
      tile.height = size.y;

      // getTile
      this.getTile({ x: x, y: y, z: z }).then(function (image) {
        _this.cacheTile(_extends({ id: id, tile: tile, ctx: ctx, image: image }, { x: x, y: y, z: z }));
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
      var id = replace(params.url, _extends({ x: x, y: y, z: z }, params));

      var coords = { x: x, y: y, z: z };

      if (zsteps > 0) {
        coords = {
          x: Math.floor(x / Math.pow(2, zsteps)),
          y: Math.floor(y / Math.pow(2, zsteps)),
          z: dataMaxZoom
        };
      }

      var tileUrl = replace(url, _extends({}, coords, params), sqlParams);

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
      this.tiles[tile.id] = _extends({}, this.tiles[tile.id], tile);
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

          var id = replace(params.url, _extends({ x: x, y: y, z: z }, params, { sqlParams: sqlParams }));

          return _this3.drawCanvas(id);
        });
      }
    }
  });

  var fetchData = function fetchData(layerModel) {
    var layerConfig = layerModel.layerConfig,
        layerRequest = layerModel.layerRequest;
    var url = layerConfig.body.url;


    if (layerRequest) {
      layerRequest.cancel('Operation canceled by the user.');
    }

    var layerRequestSource = axios.CancelToken.source();
    layerModel.set('layerRequest', layerRequestSource);

    var newLayerRequest = get$1(url, { cancelToken: layerRequestSource.token }).then(function (res) {
      if (res.status > 400) {
        console.error(res);
        return false;
      }

      return res.data;
    });

    return newLayerRequest;
  };

  function sortKD(ids, coords, nodeSize, left, right, depth) {
      if (right - left <= nodeSize) return;

      var m = Math.floor((left + right) / 2);

      select(ids, coords, m, left, right, depth % 2);

      sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
      sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
  }

  function select(ids, coords, k, left, right, inc) {

      while (right > left) {
          if (right - left > 600) {
              var n = right - left + 1;
              var m = k - left + 1;
              var z = Math.log(n);
              var s = 0.5 * Math.exp(2 * z / 3);
              var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
              var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
              var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
              select(ids, coords, k, newLeft, newRight, inc);
          }

          var t = coords[2 * k + inc];
          var i = left;
          var j = right;

          swapItem(ids, coords, left, k);
          if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);

          while (i < j) {
              swapItem(ids, coords, i, j);
              i++;
              j--;
              while (coords[2 * i + inc] < t) {
                  i++;
              }while (coords[2 * j + inc] > t) {
                  j--;
              }
          }

          if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);else {
              j++;
              swapItem(ids, coords, j, right);
          }

          if (j <= k) left = j + 1;
          if (k <= j) right = j - 1;
      }
  }

  function swapItem(ids, coords, i, j) {
      swap(ids, i, j);
      swap(coords, 2 * i, 2 * j);
      swap(coords, 2 * i + 1, 2 * j + 1);
  }

  function swap(arr, i, j) {
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
  }

  function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
      var stack = [0, ids.length - 1, 0];
      var result = [];
      var x, y;

      while (stack.length) {
          var axis = stack.pop();
          var right = stack.pop();
          var left = stack.pop();

          if (right - left <= nodeSize) {
              for (var i = left; i <= right; i++) {
                  x = coords[2 * i];
                  y = coords[2 * i + 1];
                  if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
              }
              continue;
          }

          var m = Math.floor((left + right) / 2);

          x = coords[2 * m];
          y = coords[2 * m + 1];

          if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);

          var nextAxis = (axis + 1) % 2;

          if (axis === 0 ? minX <= x : minY <= y) {
              stack.push(left);
              stack.push(m - 1);
              stack.push(nextAxis);
          }
          if (axis === 0 ? maxX >= x : maxY >= y) {
              stack.push(m + 1);
              stack.push(right);
              stack.push(nextAxis);
          }
      }

      return result;
  }

  function within(ids, coords, qx, qy, r, nodeSize) {
      var stack = [0, ids.length - 1, 0];
      var result = [];
      var r2 = r * r;

      while (stack.length) {
          var axis = stack.pop();
          var right = stack.pop();
          var left = stack.pop();

          if (right - left <= nodeSize) {
              for (var i = left; i <= right; i++) {
                  if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
              }
              continue;
          }

          var m = Math.floor((left + right) / 2);

          var x = coords[2 * m];
          var y = coords[2 * m + 1];

          if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);

          var nextAxis = (axis + 1) % 2;

          if (axis === 0 ? qx - r <= x : qy - r <= y) {
              stack.push(left);
              stack.push(m - 1);
              stack.push(nextAxis);
          }
          if (axis === 0 ? qx + r >= x : qy + r >= y) {
              stack.push(m + 1);
              stack.push(right);
              stack.push(nextAxis);
          }
      }

      return result;
  }

  function sqDist(ax, ay, bx, by) {
      var dx = ax - bx;
      var dy = ay - by;
      return dx * dx + dy * dy;
  }

  function kdbush(points, getX, getY, nodeSize, ArrayType) {
      return new KDBush(points, getX, getY, nodeSize, ArrayType);
  }

  function KDBush(points, getX, getY, nodeSize, ArrayType) {
      getX = getX || defaultGetX;
      getY = getY || defaultGetY;
      ArrayType = ArrayType || Array;

      this.nodeSize = nodeSize || 64;
      this.points = points;

      this.ids = new ArrayType(points.length);
      this.coords = new ArrayType(points.length * 2);

      for (var i = 0; i < points.length; i++) {
          this.ids[i] = i;
          this.coords[2 * i] = getX(points[i]);
          this.coords[2 * i + 1] = getY(points[i]);
      }

      sortKD(this.ids, this.coords, this.nodeSize, 0, this.ids.length - 1, 0);
  }

  KDBush.prototype = {
      range: function range$$1(minX, minY, maxX, maxY) {
          return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
      },

      within: function within$$1(x, y, r) {
          return within(this.ids, this.coords, x, y, r, this.nodeSize);
      }
  };

  function defaultGetX(p) {
      return p[0];
  }
  function defaultGetY(p) {
      return p[1];
  }

  function supercluster(options) {
      return new SuperCluster(options);
  }

  function SuperCluster(options) {
      this.options = extend(Object.create(this.options), options);
      this.trees = new Array(this.options.maxZoom + 1);
  }

  SuperCluster.prototype = {
      options: {
          minZoom: 0, // min zoom to generate clusters on
          maxZoom: 16, // max zoom level to cluster the points on
          radius: 40, // cluster radius in pixels
          extent: 512, // tile extent (radius is calculated relative to it)
          nodeSize: 64, // size of the KD-tree leaf node, affects performance
          log: false, // whether to log timing info

          // a reduce function for calculating custom cluster properties
          reduce: null, // function (accumulated, props) { accumulated.sum += props.sum; }

          // initial properties of a cluster (before running the reducer)
          initial: function initial() {
              return {};
          }, // function () { return {sum: 0}; },

          // properties to use for individual points when running the reducer
          map: function map(props) {
              return props;
          } // function (props) { return {sum: props.my_value}; },
      },

      load: function load(points) {
          var log = this.options.log;

          if (log) console.time('total time');

          var timerId = 'prepare ' + points.length + ' points';
          if (log) console.time(timerId);

          this.points = points;

          // generate a cluster object for each point and index input points into a KD-tree
          var clusters = [];
          for (var i = 0; i < points.length; i++) {
              if (!points[i].geometry) {
                  continue;
              }
              clusters.push(createPointCluster(points[i], i));
          }
          this.trees[this.options.maxZoom + 1] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);

          if (log) console.timeEnd(timerId);

          // cluster points on max zoom, then cluster the results on previous zoom, etc.;
          // results in a cluster hierarchy across zoom levels
          for (var z = this.options.maxZoom; z >= this.options.minZoom; z--) {
              var now = +Date.now();

              // create a new set of clusters for the zoom and index them with a KD-tree
              clusters = this._cluster(clusters, z);
              this.trees[z] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);

              if (log) console.log('z%d: %d clusters in %dms', z, clusters.length, +Date.now() - now);
          }

          if (log) console.timeEnd('total time');

          return this;
      },

      getClusters: function getClusters(bbox, zoom) {
          var minLng = ((bbox[0] + 180) % 360 + 360) % 360 - 180;
          var minLat = Math.max(-90, Math.min(90, bbox[1]));
          var maxLng = bbox[2] === 180 ? 180 : ((bbox[2] + 180) % 360 + 360) % 360 - 180;
          var maxLat = Math.max(-90, Math.min(90, bbox[3]));

          if (bbox[2] - bbox[0] >= 360) {
              minLng = -180;
              maxLng = 180;
          } else if (minLng > maxLng) {
              var easternHem = this.getClusters([minLng, minLat, 180, maxLat], zoom);
              var westernHem = this.getClusters([-180, minLat, maxLng, maxLat], zoom);
              return easternHem.concat(westernHem);
          }

          var tree = this.trees[this._limitZoom(zoom)];
          var ids = tree.range(lngX(minLng), latY(maxLat), lngX(maxLng), latY(minLat));
          var clusters = [];
          for (var i = 0; i < ids.length; i++) {
              var c = tree.points[ids[i]];
              clusters.push(c.numPoints ? getClusterJSON(c) : this.points[c.index]);
          }
          return clusters;
      },

      getChildren: function getChildren(clusterId) {
          var originId = clusterId >> 5;
          var originZoom = clusterId % 32;
          var errorMsg = 'No cluster with the specified id.';

          var index = this.trees[originZoom];
          if (!index) throw new Error(errorMsg);

          var origin = index.points[originId];
          if (!origin) throw new Error(errorMsg);

          var r = this.options.radius / (this.options.extent * Math.pow(2, originZoom - 1));
          var ids = index.within(origin.x, origin.y, r);
          var children = [];
          for (var i = 0; i < ids.length; i++) {
              var c = index.points[ids[i]];
              if (c.parentId === clusterId) {
                  children.push(c.numPoints ? getClusterJSON(c) : this.points[c.index]);
              }
          }

          if (children.length === 0) throw new Error(errorMsg);

          return children;
      },

      getLeaves: function getLeaves(clusterId, limit, offset) {
          limit = limit || 10;
          offset = offset || 0;

          var leaves = [];
          this._appendLeaves(leaves, clusterId, limit, offset, 0);

          return leaves;
      },

      getTile: function getTile(z, x, y) {
          var tree = this.trees[this._limitZoom(z)];
          var z2 = Math.pow(2, z);
          var extent = this.options.extent;
          var r = this.options.radius;
          var p = r / extent;
          var top = (y - p) / z2;
          var bottom = (y + 1 + p) / z2;

          var tile = {
              features: []
          };

          this._addTileFeatures(tree.range((x - p) / z2, top, (x + 1 + p) / z2, bottom), tree.points, x, y, z2, tile);

          if (x === 0) {
              this._addTileFeatures(tree.range(1 - p / z2, top, 1, bottom), tree.points, z2, y, z2, tile);
          }
          if (x === z2 - 1) {
              this._addTileFeatures(tree.range(0, top, p / z2, bottom), tree.points, -1, y, z2, tile);
          }

          return tile.features.length ? tile : null;
      },

      getClusterExpansionZoom: function getClusterExpansionZoom(clusterId) {
          var clusterZoom = clusterId % 32 - 1;
          while (clusterZoom < this.options.maxZoom) {
              var children = this.getChildren(clusterId);
              clusterZoom++;
              if (children.length !== 1) break;
              clusterId = children[0].properties.cluster_id;
          }
          return clusterZoom;
      },

      _appendLeaves: function _appendLeaves(result, clusterId, limit, offset, skipped) {
          var children = this.getChildren(clusterId);

          for (var i = 0; i < children.length; i++) {
              var props = children[i].properties;

              if (props && props.cluster) {
                  if (skipped + props.point_count <= offset) {
                      // skip the whole cluster
                      skipped += props.point_count;
                  } else {
                      // enter the cluster
                      skipped = this._appendLeaves(result, props.cluster_id, limit, offset, skipped);
                      // exit the cluster
                  }
              } else if (skipped < offset) {
                  // skip a single point
                  skipped++;
              } else {
                  // add a single point
                  result.push(children[i]);
              }
              if (result.length === limit) break;
          }

          return skipped;
      },

      _addTileFeatures: function _addTileFeatures(ids, points, x, y, z2, tile) {
          for (var i = 0; i < ids.length; i++) {
              var c = points[ids[i]];
              var f = {
                  type: 1,
                  geometry: [[Math.round(this.options.extent * (c.x * z2 - x)), Math.round(this.options.extent * (c.y * z2 - y))]],
                  tags: c.numPoints ? getClusterProperties(c) : this.points[c.index].properties
              };
              var id = c.numPoints ? c.id : this.points[c.index].id;
              if (id !== undefined) {
                  f.id = id;
              }
              tile.features.push(f);
          }
      },

      _limitZoom: function _limitZoom(z) {
          return Math.max(this.options.minZoom, Math.min(z, this.options.maxZoom + 1));
      },

      _cluster: function _cluster(points, zoom) {
          var clusters = [];
          var r = this.options.radius / (this.options.extent * Math.pow(2, zoom));

          // loop through each point
          for (var i = 0; i < points.length; i++) {
              var p = points[i];
              // if we've already visited the point at this zoom level, skip it
              if (p.zoom <= zoom) continue;
              p.zoom = zoom;

              // find all nearby points
              var tree = this.trees[zoom + 1];
              var neighborIds = tree.within(p.x, p.y, r);

              var numPoints = p.numPoints || 1;
              var wx = p.x * numPoints;
              var wy = p.y * numPoints;

              var clusterProperties = null;

              if (this.options.reduce) {
                  clusterProperties = this.options.initial();
                  this._accumulate(clusterProperties, p);
              }

              // encode both zoom and point index on which the cluster originated
              var id = (i << 5) + (zoom + 1);

              for (var j = 0; j < neighborIds.length; j++) {
                  var b = tree.points[neighborIds[j]];
                  // filter out neighbors that are already processed
                  if (b.zoom <= zoom) continue;
                  b.zoom = zoom; // save the zoom (so it doesn't get processed twice)

                  var numPoints2 = b.numPoints || 1;
                  wx += b.x * numPoints2; // accumulate coordinates for calculating weighted center
                  wy += b.y * numPoints2;

                  numPoints += numPoints2;
                  b.parentId = id;

                  if (this.options.reduce) {
                      this._accumulate(clusterProperties, b);
                  }
              }

              if (numPoints === 1) {
                  clusters.push(p);
              } else {
                  p.parentId = id;
                  clusters.push(createCluster(wx / numPoints, wy / numPoints, id, numPoints, clusterProperties));
              }
          }

          return clusters;
      },

      _accumulate: function _accumulate(clusterProperties, point) {
          var properties = point.numPoints ? point.properties : this.options.map(this.points[point.index].properties);

          this.options.reduce(clusterProperties, properties);
      }
  };

  function createCluster(x, y, id, numPoints, properties) {
      return {
          x: x, // weighted cluster center
          y: y,
          zoom: Infinity, // the last zoom the cluster was processed at
          id: id, // encodes index of the first child of the cluster and its zoom level
          parentId: -1, // parent cluster id
          numPoints: numPoints,
          properties: properties
      };
  }

  function createPointCluster(p, id) {
      var coords = p.geometry.coordinates;
      return {
          x: lngX(coords[0]), // projected point coordinates
          y: latY(coords[1]),
          zoom: Infinity, // the last zoom the point was processed at
          index: id, // index of the source feature in the original input array,
          parentId: -1 // parent cluster id
      };
  }

  function getClusterJSON(cluster) {
      return {
          type: 'Feature',
          id: cluster.id,
          properties: getClusterProperties(cluster),
          geometry: {
              type: 'Point',
              coordinates: [xLng(cluster.x), yLat(cluster.y)]
          }
      };
  }

  function getClusterProperties(cluster) {
      var count = cluster.numPoints;
      var abbrev = count >= 10000 ? Math.round(count / 1000) + 'k' : count >= 1000 ? Math.round(count / 100) / 10 + 'k' : count;
      return extend(extend({}, cluster.properties), {
          cluster: true,
          cluster_id: cluster.id,
          point_count: count,
          point_count_abbreviated: abbrev
      });
  }

  // longitude/latitude to spherical mercator in [0..1] range
  function lngX(lng) {
      return lng / 360 + 0.5;
  }
  function latY(lat) {
      var sin = Math.sin(lat * Math.PI / 180),
          y = 0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI;
      return y < 0 ? 0 : y > 1 ? 1 : y;
  }

  // spherical mercator to longitude/latitude
  function xLng(x) {
      return (x - 0.5) * 360;
  }
  function yLat(y) {
      var y2 = (180 - y * 360) * Math.PI / 180;
      return 360 * Math.atan(Math.exp(y2)) / Math.PI - 90;
  }

  function extend(dest, src) {
      for (var id in src) {
          dest[id] = src[id];
      }return dest;
  }

  function getX(p) {
      return p.x;
  }
  function getY(p) {
      return p.y;
  }

  /* eslint no-underscore-dangle: 0 */

  var _ref$2 = typeof window !== 'undefined' ? window : {},
      L$2 = _ref$2.L;

  var defaultSizes = {
    50: 25,
    100: 30,
    1000: 40
  };

  var ClusterLayer = L$2 && L$2.GeoJSON.extend({
    initialize: function initialize(layerModel) {
      var _this = this;

      var self = this;
      L$2.GeoJSON.prototype.initialize.call(this, []);
      var layerConfig = layerModel.layerConfig,
          events = layerModel.events,
          decodeClusters = layerModel.decodeClusters;

      if (!decodeClusters) {
        console.warn('You must provide a decodeClusters function');
        return;
      }

      var _ref2 = layerModel.layerConfig || {},
          html = _ref2.html,
          _ref2$sizes = _ref2.sizes,
          sizes = _ref2$sizes === undefined ? defaultSizes : _ref2$sizes,
          clusterIcon = _ref2.clusterIcon,
          icon = _ref2.icon;

      L$2.Util.setOptions(this, {
        // converts feature to icon
        pointToLayer: function pointToLayer(feature, latlng) {
          var isCluster = feature.properties && feature.properties.cluster;

          // if cluster return point icon
          if (!isCluster) {
            // see documentation for icon config https://leafletjs.com/reference-1.3.4.html#icon
            return L$2.marker(latlng, { icon: L$2.icon(_extends({ iconSize: [35, 35] }, icon)) });
          }

          var count = feature.properties.point_count;
          var iconSize = null;

          if (typeof sizes === 'function') {
            iconSize = function iconSize() {
              return sizes(count);
            };
          } else {
            var sizeKey = Object.keys(sizes).find(function (o) {
              return count <= parseInt(o, 10);
            });
            var size = sizes[sizeKey];
            iconSize = L$2.point(size, size);
          }

          // see documentation for icon config https://leafletjs.com/reference-1.3.4.html#divicon
          return L$2.marker(latlng, {
            icon: L$2.divIcon(_extends({
              iconSize: iconSize,
              html: html && typeof html === 'function' ? html(feature) : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; ' + (clusterIcon.color ? 'background-color: ' + clusterIcon.color + ';' : '') + '">' + feature.properties.point_count_abbreviated + '</div>'
            }, clusterIcon))
          });
        },


        // parses each feature before adding to the map
        onEachFeature: function onEachFeature(feature, layer) {
          if (feature.properties && feature.properties.cluster) {
            layer.on({
              click: function click() {
                return self.setMapView(feature);
              }
            });
          } else if (events) {
            layer.on(Object.keys(events).reduce(function (obj, event) {
              return _extends({}, obj, defineProperty({}, event, function (e) {
                return events[event](_extends({}, e, { data: feature.properties }));
              }));
            }, {}));
          }
        }
      });

      // https://github.com/mapbox/supercluster options available here

      var _ref3 = layerConfig || {},
          clusterConfig = _ref3.clusterConfig;

      this.supercluster = supercluster(_extends({
        radius: 80,
        maxZoom: 16
      }, clusterConfig));

      fetchData(layerModel).then(function (response) {
        var features = decodeClusters(response);
        _this.supercluster.load(features);
        _this.update();
      });
    },
    setMapView: function setMapView(feature) {
      var center = feature.geometry.coordinates;
      var zoom = this.supercluster.getClusterExpansionZoom(feature.properties.cluster_id);
      this._map.setView(center.reverse(), zoom);
    },
    onAdd: function onAdd(map) {
      L$2.GeoJSON.prototype.onAdd.call(this, map);
      map.on('moveend zoomend', this.onMove, this);
    },
    onRemove: function onRemove(map) {
      map.off('moveend zoomend', this.onMove, this);
      this.clear();
    },
    onMove: function onMove() {
      this.clear();
      this.update();
    },
    update: function update() {
      var zoom = this._map.getZoom();
      var bounds = this._map.getBounds();
      var clusterBounds = [bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat];
      var clusters = this.supercluster.getClusters(clusterBounds, zoom);
      this.addData(clusters);
    },
    clear: function clear() {
      L$2.GeoJSON.prototype.clearLayers.call(this, []);
    }
  });

  var _ref$3 = typeof window !== 'undefined' ? window : {},
      L$3 = _ref$3.L;

  var UTFGridLayer = L$3 && L$3.GridLayer.extend({
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

      var tile = L$3.DomUtil.create('div', 'leaflet-tile');
      var size = this.getTileSize();

      // setup tile width and height according to the options
      tile.width = size.x;
      tile.height = size.y;

      return tile;
    },
    onAdd: function onAdd(map) {
      // Very important line
      L$3.GridLayer.prototype.onAdd.call(this, map);

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
      return L$3.extend({ latlng: e.latlng, data: null }, e);
    }
  });

  var _ref$4 = typeof window !== 'undefined' ? window : {},
      L$4 = _ref$4.L;

  var eval2 = eval;

  var LeafletLayer = function LeafletLayer(layerModel) {
    if (!L$4) throw new Error('Leaflet must be defined.');

    var layerConfig = layerModel.layerConfig,
        params = layerModel.params,
        sqlParams = layerModel.sqlParams,
        decodeParams = layerModel.decodeParams,
        interactivity = layerModel.interactivity;

    var layer = void 0;

    var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

    // Transforming data layer
    if (layerConfigParsed.body.crs && L$4.CRS[layerConfigParsed.body.crs]) {
      layerConfigParsed.body.crs = L$4.CRS[layerConfigParsed.body.crs.replace(':', '')];
      layerConfigParsed.body.pane = 'tilePane';
    }

    switch (layerConfigParsed.type) {
      case 'wms':
        layer = L$4.tileLayer.wms(layerConfigParsed.url || layerConfigParsed.body.url, layerConfigParsed.body);
        break;
      case 'tileLayer':
        if (JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0) {
          layerConfigParsed.body.style = eval2('(' + layerConfigParsed.body.style + ')');
        }
        if (decodeParams && layerConfigParsed.canvas) {
          layer = new CanvasLayer(_extends({}, layerModel));
        } else {
          layer = L$4.tileLayer(layerConfigParsed.url || layerConfigParsed.body.url, layerConfigParsed.body);
        }

        // Add interactivity
        if (interactivity) {
          var interactiveLayer = new UTFGridLayer();

          var LayerGroup = L$4.LayerGroup.extend({
            group: true,
            setOpacity: function setOpacity(opacity) {
              layerModel.mapLayer.getLayers().forEach(function (l) {
                l.setOpacity(opacity);
              });
            }
          });

          layer = new LayerGroup([layer, interactiveLayer]);
        }

        break;
      case 'cluster':
        if (JSON.stringify(layerConfigParsed.body).indexOf('style: "function') >= 0) {
          layerConfigParsed.body.style = eval2('(' + layerConfigParsed.body.style + ')');
        }
        layer = new ClusterLayer(layerModel);
        break;
      default:
        layer = L$4[layerConfigParsed.type](layerConfigParsed.body, layerConfigParsed.options || {});
        break;
    }

    return new Promise(function (resolve, reject) {
      if (layer) {
        resolve(layer);
      } else {
        reject(new Error('"type" specified in layer spec doesn`t exist'));
      }
    });
  };

  /* eslint no-underscore-dangle: ["error", { "allow": ["_currentImage", "_image"] }] */

  var _ref$5 = typeof window !== 'undefined' ? window : {},
      L$5 = _ref$5.L;

  var eval2$1 = eval;

  var EsriLayer = function EsriLayer(layerModel) {
    if (!L$5) throw new Error('Leaflet must be defined.');
    if (!L$5.esri) {
      throw new Error('To support this layer you should add esri library for Leaflet.');
    }

    // Preparing layerConfig
    var layerConfig = layerModel.layerConfig,
        interactivity = layerModel.interactivity,
        params = layerModel.params,
        sqlParams = layerModel.sqlParams;

    var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));

    var bodyStringified = JSON.stringify(layerConfigParsed.body || {}).replace(/"mosaic-rule":/g, '"mosaicRule":').replace(/"mosaic_rule":/g, '"mosaicRule":').replace(/"use-cors":/g, '"useCors":').replace(/"use_cors":/g, '"useCors":');

    // If type is a method of leaflet, returns LeafletLayer
    if (L$5[layerConfigParsed.type]) return new LeafletLayer(_extends({}, layerModel));

    return new Promise(function (resolve, reject) {
      if (!L$5.esri[layerConfigParsed.type]) {
        return reject(new Error('"type" specified in layer spec doesn`t exist'));
      }

      var layerOptions = JSON.parse(bodyStringified);
      layerOptions.pane = 'tilePane';
      layerOptions.useCors = true;
      // forcing cors
      if (layerOptions.style && layerOptions.style.indexOf('function') >= 0) {
        layerOptions.style = eval2$1('(' + layerOptions.style + ')');
      }

      var layer = void 0;

      layer = L$5.esri[layerConfigParsed.type](layerOptions);

      if (layer) {
        // Little hack to set zIndex at the beginning
        layer.on('load', function () {
          layer.setZIndex(layerModel.zIndex);
        });

        layer.on('requesterror', function (err) {
          return console.error(err);
        });
      } else {
        return reject();
      }

      if (!layer.setZIndex) {
        layer.setZIndex = function (zIndex) {
          if (layer._currentImage) {
            layer._currentImage._image.style.zIndex = zIndex;
          }
        };
      }

      // Add interactivity
      if (interactivity) {
        var interactiveLayer = new UTFGridLayer();

        var LayerGroup = L$5.LayerGroup.extend({
          group: true,
          setOpacity: function setOpacity(opacity) {
            layerModel.mapLayer.getLayers().forEach(function (l) {
              l.setOpacity(opacity);
            });
          }
        });

        layer = new LayerGroup([layer, interactiveLayer]);
      }

      return resolve(layer);
    });
  };

  var _ref$6 = typeof window !== 'undefined' ? window : {},
      L$6 = _ref$6.L;

  var GEELayer = function GEELayer(layerModel) {
    if (!L$6) throw new Error('Leaflet must be defined.');

    var id = layerModel.id,
        layerConfig = layerModel.layerConfig,
        interactivity = layerModel.interactivity,
        params = layerModel.params,
        sqlParams = layerModel.sqlParams,
        decodeParams = layerModel.decodeParams;

    var tileUrl = 'https://api.resourcewatch.org/v1/layer/' + id + '/tile/gee/{z}/{x}/{y}';
    var layerConfigParsed = layerConfig.parse === false ? layerConfig : JSON.parse(replace(JSON.stringify(layerConfig), params, sqlParams));
    var layer = void 0;

    switch (layerConfigParsed.type) {
      case 'tileLayer':
        if (decodeParams) {
          layer = new CanvasLayer(_extends({}, layerModel));
        } else {
          layer = L$6.tileLayer(tileUrl, layerConfigParsed.body);
        }
        break;
      default:
        layer = L$6.tileLayer(tileUrl, layerConfigParsed.body);
        break;
    }

    // Add interactivity
    if (interactivity) {
      var interactiveLayer = new UTFGridLayer();

      var LayerGroup = L$6.LayerGroup.extend({
        group: true,
        setOpacity: function setOpacity(opacity) {
          layerModel.mapLayer.getLayers().forEach(function (l) {
            l.setOpacity(opacity);
          });
        }
      });

      layer = new LayerGroup([layer, interactiveLayer]);
    }

    return new Promise(function (resolve, reject) {
      if (layer) {
        resolve(layer);
      } else {
        reject(new Error('"type" specified in layer spec doesn`t exist'));
      }
    });
  };

  var _ref$7 = typeof window !== 'undefined' ? window : {},
      L$7 = _ref$7.L;

  var maxBounds = L$7 && new L$7.LatLngBounds(new L$7.LatLng(49.496674527470455, -66.357421875), new L$7.LatLng(24.607069137709683, -131.66015625));

  var LOCALayer = function LOCALayer(layerModel) {
    var id = layerModel.id,
        layerConfig = layerModel.layerConfig,
        interactivity = layerModel.interactivity;
    var period = layerConfig.period;

    var year = (period || {}).value || '1971';
    var dateString = new Date(year).toISOString();
    var tileUrl = 'https://api.resourcewatch.org/v1/layer/' + id + '/tile/loca/{z}/{x}/{y}?year=' + dateString;

    var layer = L$7.tileLayer(tileUrl, _extends({}, layerConfig.body, {
      minNativeZoom: 4,
      bounds: maxBounds
    }));

    // Add interactivity
    if (interactivity) {
      var interactiveLayer = new UTFGridLayer();

      var LayerGroup = L$7.LayerGroup.extend({
        group: true,
        setOpacity: function setOpacity(opacity) {
          layerModel.mapLayer.getLayers().forEach(function (l) {
            l.setOpacity(opacity);
          });
        }
      });

      layer = new LayerGroup([layer, interactiveLayer]);
    }

    return new Promise(function (resolve) {
      resolve(layer);
    });
  };

  var _ref$8 = typeof window !== 'undefined' ? window : {},
      L$8 = _ref$8.L;

  var NEXGDDPLayer = function NEXGDDPLayer(layerModel) {
    var id = layerModel.id,
        layerConfig = layerModel.layerConfig,
        interactivity = layerModel.interactivity;
    var period = layerConfig.period;

    var year = (period || {}).value || '1971-01-01';
    var dateString = new Date(year).toISOString();
    var tileUrl = 'https://api.resourcewatch.org/v1/layer/' + id + '/tile/nexgddp/{z}/{x}/{y}?year=' + dateString;

    var layer = L$8.tileLayer(tileUrl, layerConfig.body);

    // Add interactivity
    if (interactivity) {
      var interactiveLayer = new UTFGridLayer();

      var LayerGroup = L$8.LayerGroup.extend({
        group: true,
        setOpacity: function setOpacity(opacity) {
          layerModel.mapLayer.getLayers().forEach(function (l) {
            l.setOpacity(opacity);
          });
        }
      });

      layer = new LayerGroup([layer, interactiveLayer]);
    }

    return new Promise(function (resolve) {
      resolve(layer);
    });
  };

  var PluginLeaflet = function () {
    function PluginLeaflet(map) {
      var _this = this;

      classCallCheck(this, PluginLeaflet);
      this.events = {};
      this.method = {
        // CARTO
        cartodb: CartoLayer,
        carto: CartoLayer,
        raster: CartoLayer,
        // ESRI
        arcgis: EsriLayer,
        featureservice: EsriLayer,
        mapservice: EsriLayer,
        tileservice: EsriLayer,
        esrifeatureservice: EsriLayer,
        esrimapservice: EsriLayer,
        esritileservice: EsriLayer,
        // GEE && LOCA && NEXGDDP
        gee: GEELayer,
        loca: LOCALayer,
        nexgddp: NEXGDDPLayer,
        // LEAFLET
        leaflet: LeafletLayer,
        wms: LeafletLayer
      };

      this.setEvents = function (layerModel) {
        var mapLayer = layerModel.mapLayer,
            events = layerModel.events;

        if (layerModel.layerConfig.type !== 'cluster') {
          // Remove current events
          if (_this.events[layerModel.id]) {
            Object.keys(_this.events[layerModel.id]).forEach(function (k) {
              if (mapLayer.group) {
                mapLayer.eachLayer(function (l) {
                  l.off(k);
                });
              } else {
                mapLayer.off(k);
              }
            });
          }

          // Add new events
          Object.keys(events).forEach(function (k) {
            if (mapLayer.group) {
              mapLayer.eachLayer(function (l) {
                l.on(k, events[k]);
              });
            } else {
              mapLayer.on(k, events[k]);
            }
          });
          // Set this.events equal to current ones
          _this.events[layerModel.id] = events;
        }

        return _this;
      };

      this.map = map;
    }

    createClass(PluginLeaflet, [{
      key: 'add',


      /**
       * Add a layer
       * @param {Object} layerModel
       */
      value: function add(layerModel) {
        var mapLayer = layerModel.mapLayer;


        this.map.addLayer(mapLayer);
      }

      /**
       * Remove a layer
       * @param {Object} layerModel
       */

    }, {
      key: 'remove',
      value: function remove(layerModel) {
        var mapLayer = layerModel.mapLayer,
            events = layerModel.events;


        if (events && mapLayer) {
          Object.keys(events).forEach(function (k) {
            if (mapLayer.group) {
              mapLayer.eachLayer(function (l) {
                l.off(k);
              });
            } else {
              mapLayer.off(k);
            }
          });
        }

        if (mapLayer) {
          this.map.removeLayer(mapLayer);
        }
      }

      /**
       * Get provider method
       * @param {String} provider
       */

    }, {
      key: 'getLayerByProvider',
      value: function getLayerByProvider(provider) {
        return this.method[provider];
      }

      /**
       * A namespace to set z-index
       * @param {Object} layerModel
       * @param {Number} zIndex
       */

    }, {
      key: 'setZIndex',
      value: function setZIndex(layerModel, zIndex) {
        var mapLayer = layerModel.mapLayer;


        mapLayer.setZIndex(zIndex);

        return this;
      }

      /**
       * A namespace to set opacity
       * @param {Object} layerModel
       * @param {Number} opacity
       */

    }, {
      key: 'setOpacity',
      value: function setOpacity(layerModel, opacity) {
        var mapLayer = layerModel.mapLayer;


        if (typeof mapLayer.setOpacity === 'function') {
          mapLayer.setOpacity(opacity);
        }

        if (typeof mapLayer.setStyle === 'function') {
          mapLayer.setStyle({ opacity: opacity });
        }

        return this;
      }

      /**
       * A namespace to hide or show a selected layer
       * @param {Object} layerModel
       * @param {Boolean} visibility
       */

    }, {
      key: 'setVisibility',
      value: function setVisibility(layerModel, visibility) {
        var opacity = layerModel.opacity;


        this.setOpacity(layerModel, !visibility ? 0 : opacity);
      }

      /**
       * A namespace to set DOM events
       * @param {Object} layerModel
      */

    }, {
      key: 'setParams',
      value: function setParams(layerModel) {
        this.remove(layerModel);
      }
    }, {
      key: 'setLayerConfig',
      value: function setLayerConfig(layerModel) {
        this.remove(layerModel);
      }
    }, {
      key: 'setDecodeParams',
      value: function setDecodeParams(layerModel) {
        var mapLayer = layerModel.mapLayer,
            params = layerModel.params,
            sqlParams = layerModel.sqlParams,
            decodeParams = layerModel.decodeParams,
            decodeFunction = layerModel.decodeFunction;


        mapLayer.reDraw({ decodeParams: decodeParams, decodeFunction: decodeFunction, params: params, sqlParams: sqlParams });

        return this;
      }
    }]);
    return PluginLeaflet;
  }();

  var cartoLayer = (function (Cesium) {
    return function (layerModel) {
      return fetchTile(layerModel).then(function (response) {
        var layerConfig = layerModel.layerConfig;

        var url = response.cdn_url.templates.https.url + '/' + layerConfig.account + '/api/v1/map/' + response.layergroupid + '/{z}/{x}/{y}.png';
        var provider = new Cesium.UrlTemplateImageryProvider({ url: url });
        provider.errorEvent.addEventListener(function () {
          return false;
        });
        // don't show warnings
        return new Cesium.ImageryLayer(provider);
      });
    };
  });

  var tileLayer = (function (Cesium) {
    return function (layerModel) {
      return new Promise(function (resolve) {
        var _layerModel$layerConf = layerModel.layerConfig,
            layerConfig = _layerModel$layerConf === undefined ? {} : _layerModel$layerConf;
        var url = layerConfig.body.url;

        var provider = new Cesium.UrlTemplateImageryProvider({ url: url });
        provider.errorEvent.addEventListener(function () {
          return false;
        });
        // don't show warnings
        resolve(new Cesium.ImageryLayer(provider));
      });
    };
  });

  var PluginCesium = function () {
    function PluginCesium(map) {
      classCallCheck(this, PluginCesium);

      _initialiseProps.call(this);

      var Cesium = PluginCesium.Cesium;

      this.map = map;
      this.eventListener = new Cesium.ScreenSpaceEventHandler(map.scene.canvas);

      this.method = {
        carto: cartoLayer(Cesium),
        cartodb: cartoLayer(Cesium),
        cesium: tileLayer(Cesium)
      };
    }

    createClass(PluginCesium, [{
      key: 'add',
      value: function add(layerModel) {
        var mapLayer = layerModel.mapLayer;

        this.map.imageryLayers.add(mapLayer);
      }
    }, {
      key: 'remove',
      value: function remove(layerModel) {
        var mapLayer = layerModel.mapLayer;

        this.map.imageryLayers.remove(mapLayer, true);
        this.eventListener.destroy();
      }
    }, {
      key: 'getLayerByProvider',
      value: function getLayerByProvider(provider) {
        return this.method[provider];
      }
    }, {
      key: 'setZIndex',
      value: function setZIndex(layerModel, zIndex) {
        var length = this.map.imageryLayers.length;
        var mapLayer = layerModel.mapLayer;

        var layerIndex = zIndex >= length ? length - 1 : zIndex;
        var nextIndex = zIndex < 0 ? 0 : layerIndex;
        var currentIndex = this.map.imageryLayers.indexOf(mapLayer);
        if (currentIndex !== nextIndex) {
          var steps = nextIndex - currentIndex;
          for (var i = 0; i < Math.abs(steps); i++) {
            if (steps > 0) {
              this.map.imageryLayers.raise(mapLayer);
            } else {
              this.map.imageryLayers.lower(mapLayer);
            }
          }
        }
        return this;
      }
    }, {
      key: 'setOpacity',
      value: function setOpacity(layerModel, opacity) {
        var mapLayer = layerModel.mapLayer;

        mapLayer.alpha = opacity;
        return this;
      }
    }, {
      key: 'setVisibility',
      value: function setVisibility(layerModel, visibility) {
        var mapLayer = layerModel.mapLayer;

        mapLayer.show = visibility;
        return this;
      }
    }, {
      key: 'setEvents',
      value: function setEvents(layerModel) {
        var _this = this;

        var events = layerModel.events;

        Object.keys(events).forEach(function (type) {
          var action = events[type];
          if (_this.eventListener.getInputAction(type)) {
            _this.eventListener.removeInputAction(type);
          }
          _this.eventListener.setInputAction(_this.getCoordinatesFromEvent(action), type);
        });
        return this;
      }
    }, {
      key: 'setParams',
      value: function setParams(layerModel) {
        this.remove(layerModel);
      }
    }, {
      key: 'setLayerConfig',
      value: function setLayerConfig(layerModel) {
        this.remove(layerModel);
      }
    }, {
      key: 'setDecodeParams',
      value: function setDecodeParams(layerModel) {
        console.info('Decode params callback', layerModel, this);
      }
    }]);
    return PluginCesium;
  }();

  PluginCesium.Cesium = typeof window !== 'undefined' ? window.Cesium : null;

  var _initialiseProps = function _initialiseProps() {
    var _this2 = this;

    this.getCoordinatesFromEvent = function (action) {
      return function (event) {
        var position = event.position;
        var Cesium = PluginCesium.Cesium;

        var clicked = new Cesium.Cartesian2(position.x, position.y);
        var ellipsoid = _this2.map.scene.globe.ellipsoid;

        var cartesian = _this2.map.camera.pickEllipsoid(clicked, ellipsoid);
        if (cartesian) {
          var cartographic = ellipsoid.cartesianToCartographic(cartesian);
          var lat = Cesium.Math.toDegrees(cartographic.latitude);
          var lng = Cesium.Math.toDegrees(cartographic.longitude);
          action(event, { lat: lat, lng: lng });
        }
      };
    };
  };

  var LayerModel = function () {
    function LayerModel() {
      var layerSpec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      classCallCheck(this, LayerModel);
      this.opacity = 1;
      this.visibility = true;

      Object.assign(this, layerSpec, { changedAttributes: {} });
    }

    createClass(LayerModel, [{
      key: 'get',
      value: function get$$1(key) {
        return this[key];
      }
    }, {
      key: 'set',
      value: function set$$1(key, value) {
        this[key] = value;
        return this;
      }
    }, {
      key: 'update',
      value: function update(layerSpec) {
        var _this = this;

        var prevData = _extends({}, this);
        var nextData = _extends({}, layerSpec);

        // reseting changedAttributes for every update
        this.set('changedAttributes', {});

        Object.keys(nextData).forEach(function (k) {
          if (!isEqual(prevData[k], nextData[k])) {
            _this.changedAttributes[k] = nextData[k];
            _this.set(k, nextData[k]);
          }
        });
      }
    }]);
    return LayerModel;
  }();

  function checkPluginProperties(plugin) {
    if (plugin) {
      var requiredProperties = ['add', 'remove', 'setVisibility', 'setOpacity', 'setEvents', 'setZIndex', 'setLayerConfig', 'setParams', 'setDecodeParams', 'getLayerByProvider'];

      requiredProperties.forEach(function (property) {
        if (!plugin[property]) {
          console.error('The ' + property + ' function is required for layer manager plugins');
        }
      });
    }
  }

  var LayerManager = function () {
    function LayerManager(map, Plugin) {
      classCallCheck(this, LayerManager);

      this.map = map;
      this.plugin = new Plugin(this.map);
      checkPluginProperties(this.plugin);
      this.layers = [];
      this.promises = {};
    }

    /**
     * Render layers
     */


    createClass(LayerManager, [{
      key: 'renderLayers',
      value: function renderLayers() {
        var _this = this;

        if (this.layers.length > 0) {
          this.layers.forEach(function (layerModel) {
            var changedAttributes = layerModel.changedAttributes;
            var sqlParams = changedAttributes.sqlParams,
                params = changedAttributes.params,
                layerConfig = changedAttributes.layerConfig;

            var hasChanged = Object.keys(changedAttributes).length > 0;
            var shouldUpdate = sqlParams || params || layerConfig;

            if (!shouldUpdate) {
              // If layer exists and didn't change don't do anything
              if (layerModel.mapLayer && !hasChanged) {
                return false;
              }

              // In case has changed, just update it else if (
              if (layerModel.mapLayer && hasChanged) {
                return _this.updateLayer(layerModel);
              }
            }

            if (layerModel.mapLayer && shouldUpdate) {
              _this.updateLayer(layerModel);
            }

            // adds a new promise to `this.promises` every time it gets called
            _this.requestLayer(layerModel);

            // reset changedAttributes
            return layerModel.set('changedAttributes', {});
          });

          if (Object.keys(this.promises).length === 0) {
            return Promise.resolve(this.layers);
          }

          return Promise.all(Object.values(this.promises)).then(function () {
            return _this.layers;
          }).finally(function () {
            _this.promises = {};
          });
        }

        // By default it will return a empty layers
        return Promise.resolve(this.layers);
      }

      /**
       * Add layers
       * @param {Array} layers
       * @param {Object} layerOptions
       */

    }, {
      key: 'add',
      value: function add(layers) {
        var _this2 = this;

        var layerOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
          opacity: 1,
          visibility: true,
          zIndex: 0,
          interactivity: null
        };

        if (typeof layers === 'undefined') {
          console.error('layers is required');
          return this;
        }

        if (!Array.isArray(layers)) {
          console.error('layers should be an array');
          return this;
        }

        layers.forEach(function (layer) {
          var existingLayer = _this2.layers.find(function (l) {
            return l.id === layer.id;
          });
          var nextModel = _extends({}, layer, layerOptions);

          if (existingLayer) {
            existingLayer.update(nextModel);
          } else {
            _this2.layers.push(new LayerModel(nextModel));
          }
        });

        return this.layers;
      }

      /**
       * Updating a specific layer
       * @param  {Object} layerModel
       */

    }, {
      key: 'updateLayer',
      value: function updateLayer(layerModel) {
        var _layerModel$changedAt = layerModel.changedAttributes,
            opacity = _layerModel$changedAt.opacity,
            visibility = _layerModel$changedAt.visibility,
            zIndex = _layerModel$changedAt.zIndex,
            params = _layerModel$changedAt.params,
            sqlParams = _layerModel$changedAt.sqlParams,
            decodeParams = _layerModel$changedAt.decodeParams,
            layerConfig = _layerModel$changedAt.layerConfig,
            events = _layerModel$changedAt.events;


        if (typeof opacity !== 'undefined') {
          this.plugin.setOpacity(layerModel, opacity);
        }
        if (typeof visibility !== 'undefined') {
          this.plugin.setOpacity(layerModel, !visibility ? 0 : layerModel.opacity);
        }
        if (typeof zIndex !== 'undefined') {
          this.plugin.setZIndex(layerModel, zIndex);
        }
        if (typeof events !== 'undefined') {
          this.setEvents(layerModel);
        }

        if (!isEmpty(layerConfig)) this.plugin.setLayerConfig(layerModel);
        if (!isEmpty(params)) this.plugin.setParams(layerModel);
        if (!isEmpty(sqlParams)) this.plugin.setParams(layerModel);
        if (!isEmpty(decodeParams)) this.plugin.setDecodeParams(layerModel);
      }

      /**
       * Remove a layer giving a Layer ID
       * @param {Array} layerIds
       */

    }, {
      key: 'remove',
      value: function remove(layerIds) {
        var _this3 = this;

        var layers = this.layers.slice(0);
        var ids = Array.isArray(layerIds) ? layerIds : [layerIds];

        this.layers.forEach(function (layerModel, index) {
          if (ids) {
            if (ids.includes(layerModel.id)) {
              _this3.plugin.remove(layerModel);
              layers.splice(index, 1);
            }
          } else {
            _this3.plugin.remove(layerModel);
          }
        });

        this.layers = ids ? layers : [];
      }

      /**
       * A namespace to set opacity on selected layer
       * @param {Array} layerIds
       * @param {Number} opacity
       */

    }, {
      key: 'setOpacity',
      value: function setOpacity(layerIds, opacity) {
        var _this4 = this;

        var layerModels = this.layers.filter(function (l) {
          return layerIds.includes(l.id);
        });

        if (layerModels.length) {
          layerModels.forEach(function (lm) {
            _this4.plugin.setOpacity(lm, opacity);
          });
        } else {
          console.error("Can't find the layer");
        }
      }

      /**
       * A namespace to hide or show a selected layer
       * @param {Array} layerIds
       * @param {Boolean} visibility
       */

    }, {
      key: 'setVisibility',
      value: function setVisibility(layerIds, visibility) {
        var _this5 = this;

        var layerModels = this.layers.filter(function (l) {
          return layerIds.includes(l.id);
        });

        if (layerModels.length) {
          layerModels.forEach(function (lm) {
            _this5.plugin.setVisibility(lm, visibility);
          });
        } else {
          console.error("Can't find the layer");
        }
      }

      /**
       * A namespace to set z-index on selected layer
       * @param {Array} layerIds
       * @param {Number} zIndex
       */

    }, {
      key: 'setZIndex',
      value: function setZIndex(layerIds, zIndex) {
        var _this6 = this;

        var layerModels = this.layers.filter(function (l) {
          return layerIds.includes(l.id);
        });

        if (layerModels.length) {
          layerModels.forEach(function (lm) {
            _this6.plugin.setZIndex(lm, zIndex);
          });
        } else {
          console.error("Can't find the layer");
        }
      }

      /**
       * A namespace to set events on selected layer
       * @param  {Object} layerModel
       */

    }, {
      key: 'setEvents',
      value: function setEvents(layerModel) {
        var events = layerModel.events;


        if (events) {
          // Let's leave the managment of event to the plugin
          this.plugin.setEvents(layerModel);
        }
      }
    }, {
      key: 'requestLayer',
      value: function requestLayer(layerModel) {
        var _this7 = this;

        var provider = layerModel.provider;

        var method = this.plugin.getLayerByProvider(provider);

        if (!method) {
          this.promises[layerModel.id] = Promise.reject(new Error(provider + ' provider is not yet supported.'));
          return false;
        }

        // Cancel previous/existing request
        if (this.promises[layerModel.id] && this.promises[layerModel.id].isPending && this.promises[layerModel.id].isPending()) {
          this.promises[layerModel.id].cancel();
        }

        // every render method returns a promise that we store in the array
        // to control when all layers are fetched.
        this.promises[layerModel.id] = method.call(this, layerModel).then(function (layer) {
          layerModel.set('mapLayer', layer);

          _this7.plugin.add(layerModel);
          _this7.plugin.setZIndex(layerModel, layerModel.zIndex);
          _this7.plugin.setOpacity(layerModel, layerModel.opacity);
          _this7.plugin.setVisibility(layerModel, layerModel.visibility);

          _this7.setEvents(layerModel);
        });

        return this;
      }
    }]);
    return LayerManager;
  }();

  // This file exists as an entry point for bundling our umd builds.

  LayerManager.PluginLeaflet = PluginLeaflet;
  LayerManager.PluginCesium = PluginCesium;
  LayerManager.replace = replace;
  LayerManager.substitution = substitution;
  LayerManager.concatenation = concatenation;

  return LayerManager;

})));
