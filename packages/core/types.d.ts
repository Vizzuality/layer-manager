import type {
  AnyLayer,
  GeoJSONSourceRaw,
  Map,
  RasterSource,
  VectorSource,
} from 'mapbox-gl';

import type { LayerModel } from './src';

export { default } from './src';

export { LayerModel } from './src';

export type LayerType = 'geojson' | 'raster' | 'vector' | 'deck';

/**
 * 'carto' provider requires @vizzuality/layer-manager-provider-carto
 */
export type Provider = {
  type: 'carto' | string
  options: Record<string, unknown>
};

export type LMGeoJSONSourceRaw = GeoJSONSourceRaw & {
  provider: Provider
  parse: boolean
};

export type LMVectorSource = VectorSource & {
  provider: Provider
  parse: boolean
};

export type LMRasterSource = RasterSource & {
  provider: Provider
  parse: boolean
};

export type Source = LMGeoJSONSourceRaw | LMVectorSource | LMRasterSource;

export type Render = {
  layers: AnyLayer
  parse: boolean
};

export type Params = Record<string, string | number | boolean | unknown>;

/**
 * keys should start by 'where' or 'and'
 */
export type SQLParams = Record<string, Params>;

/**
 * Documentation for images on MapboxGL
 * https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addimage
 */
export type Image = {
  id: string
  src: string
  options?: { pixelRatio?: number; sdf?: boolean }
};

export type LayerSpec = {
  id: string | number
  type: LayerType
  opacity?: number
  visibility?: boolean
  zIndex?: number
  images?: Image[]
  params?: Params
  sqlParams?: SQLParams
  source: Source
  render?: Render
  interactivity?: unknown[]
  deck?: any[]
  onAfterAdd?: (layerModel: LayerModel) => void
  onAfterRemove?: (layerModel: LayerModel) => void
};

export interface ProviderMaker {
  name: string
  handleData: (
    layerModel: LayerModel,
    layer: LayerSpec,
    resolve: (layerSpec: LayerSpec) => void,
    reject?: (err: Error) => void,
  ) => void
}

export interface Plugin {
  map: Map | unknown
  add: (layerModel: LayerModel, layers: LayerModel[]) => void
  remove: (layerModel: LayerModel) => void
  setVisibility: (layerModel: LayerModel, visibility: boolean) => void
  setOpacity: (layerModel: LayerModel, opacity: number) => void
  setZIndex: (layerModel: LayerModel, zIndex: number) => void
  setSource: (layerModel: LayerModel) => void
  setRender: (layerModel: LayerModel) => void
  setParams: (layerModel: LayerModel) => void
  setSQLParams: (layerModel: LayerModel) => void
  setDeck: (layerModel: LayerModel) => void
  getMap: () => Map
  getLayerByType: (type: LayerModel['type']) => any // TO-DO: better type definition
  getLayerByProvider?: () => void // Deprecated
  setOptions: (options: Record<string, unknown>) => void
  unmount: () => void
}

export class PluginConstructor implements Partial<Plugin> {
  constructor(map: Map)
}
