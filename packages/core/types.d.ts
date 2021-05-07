import {
  AnyLayer,
  GeoJSONSourceRaw, RasterSource, VectorSource
} from "mapbox-gl";

import { Layer } from './src/layer-model'

export type LayerType = 'geojson' | 'raster' | 'vector'

export type Source = GeoJSONSourceRaw | VectorSource | RasterSource & {
  // TO-DO: define providers types
  provider: {
    type: string
    options: Record<string, unknown>
  }
}

export type Params = Record<string, unknown>

/**
 * keys should start by "where" or "and"
 */
export type SQLParams = Record<string, Params>
export type DecodeParams = Record<string, number>

/**
 * Documentation for images on MapboxGL
 * https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addimage
 */
export type Image = {
  id: string
  src: string
  options?: { pixelRatio?: number; sdf?: boolean }
}

export type LayerSpec = {
  id: [index: string | number]
  type: LayerType
  opacity?: number
  visibility?: boolean
  zIndex?: number
  images?: Image[]
  params?: Params
  sqlParams?: SQLParams
  decodeParams?: DecodeParams
  decodeFunction: string
  source: Source
  render?: {
    layers: AnyLayer
  }
  onAfterAdd: (layerModel: Layer) => void
  onAfterRemove: (layerModel: Layer) => void
};
