const TILE_SIZE = 256;
const { PI } = Math;
const PI_4 = PI / 4;
const DEGREES_TO_RADIANS = PI / 180;

function lngLatToWorld([lng, lat], scale) {
  if (
    !Number.isFinite(lng)
    || !Number.isFinite(scale)
    || !(Number.isFinite(lat) && lat >= -90 && lat <= 90)
  ) {
    return console.error('lngLatToWorld: lng, lat or scale are not correct values');
  }

  const s = TILE_SIZE * 2 * scale;
  const lambda2 = lng * DEGREES_TO_RADIANS;
  const phi2 = lat * DEGREES_TO_RADIANS;
  const x = (s * (lambda2 + PI)) / (2 * PI);
  const y = (s * (PI - Math.log(Math.tan(PI_4 + phi2 * 0.5)))) / (2 * PI);
  return [x, y];
}
function getBoundingBox(viewport) {
  const corners = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([0, viewport.height]),
    viewport.unproject([viewport.width, viewport.height]),
  ];

  return [
    corners.reduce((minLng, p) => (minLng < p[0] ? minLng : p[0]), 180),
    corners.reduce((minLat, p) => (minLat < p[1] ? minLat : p[1]), 90),
    corners.reduce((maxLng, p) => (maxLng > p[0] ? maxLng : p[0]), -180),
    corners.reduce((maxLat, p) => (maxLat > p[1] ? maxLat : p[1]), -90),
  ];
}

function pixelsToTileIndex(a) {
  return a / TILE_SIZE;
}

/**
 * Calculates and returns a new tile index {x, y, z}, with z being the given adjustedZ.
 */
function getAdjustedTileIndex({ x, y, z }, adjustedZ) {
  const m = 2 ** (z - adjustedZ);
  return {
    x: Math.floor(x / m),
    y: Math.floor(y / m),
    z: adjustedZ,
  };
}

/**
 * Returns all tile indices in the current viewport. If the current zoom level is smaller
 * than minZoom, return an empty array. If the current zoom level is greater than maxZoom,
 * return tiles that are on maxZoom.
 */
export function getTileIndices(viewport, maxZoom, minZoom) {
  const z = Math.floor(viewport.zoom) + 1;
  if (minZoom && z < minZoom) {
    return [];
  }

  // eslint-disable-next-line no-param-reassign
  viewport = new viewport.constructor({
    ...viewport,
    zoom: z - 1,
  });

  const bbox = getBoundingBox(viewport);

  let [minX, minY] = lngLatToWorld([bbox[0], bbox[3]], viewport.scale).map(pixelsToTileIndex);
  let [maxX, maxY] = lngLatToWorld([bbox[2], bbox[1]], viewport.scale).map(pixelsToTileIndex);

  minX = Math.floor(minX);
  maxX = Math.ceil(maxX);
  minY = Math.floor(minY);
  maxY = Math.ceil(maxY);

  const indices = [];

  for (let x = minX; x < maxX; x += 1) {
    for (let y = minY; y < maxY; y += 1) {
      if (maxZoom && z > maxZoom) {
        indices.push(getAdjustedTileIndex({ x, y, z }, maxZoom));
      } else {
        indices.push({ x, y, z });
      }
    }
  }

  return indices;
}

export default getTileIndices;
