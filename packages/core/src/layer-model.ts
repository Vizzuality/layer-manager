import {
  AnyLayer,
  GeoJSONSourceRaw,
  RasterSource,
  VectorSource
} from "mapbox-gl";
import { CancelTokenSource } from 'axios';
import isEqual from 'lodash/isEqual';

export type LayerType = 'geojson' | 'raster' | 'vector'

/**
 * "carto" provider requires @vizzuality/layer-manager-provider-carto
 */
export type Provider = {
  type: 'carto' | string
  options: Record<string, unknown>
}

export type LMGeoJSONSourceRaw = GeoJSONSourceRaw & {
  provider: Provider
}

export type LMVectorSource = VectorSource & {
  provider: Provider
}

export type LMRasterSource = RasterSource & {
  provider: Provider
}

export type Source = LMGeoJSONSourceRaw | LMVectorSource | LMRasterSource

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
  uid?: number // for internal purposes
  id: string | number
  type: LayerType
  opacity?: number
  visibility?: boolean
  zIndex?: number
  images?: Image[]
  params?: Params
  sqlParams?: SQLParams
  decodeParams?: DecodeParams
  decodeFunction?: string
  source: Source
  render?: {
    layers: AnyLayer
  }
  interactivity?: unknown[],
  onAfterAdd?: (layerModel: LayerModel) => void
  onAfterRemove?: (layerModel: LayerModel) => void
};

const defaultLayerSpec: Partial<LayerSpec> = {
  opacity: 1,
  visibility: true,
};

export class LayerModel {
  static _counter = 0

  private _changedAttributes: Partial<LayerSpec> = {}

  public layerRequest: CancelTokenSource | undefined = undefined

  public mapLayer: unknown // depends on the plugin

  constructor(private _layerSpec: LayerSpec) {
    if (!_layerSpec) throw new Error('layerSpec object is required');

    // updating counter for internal purposes
    LayerModel._counter = LayerModel._counter++;

    this._layerSpec = {
      ...defaultLayerSpec,
      ..._layerSpec,
      uid: LayerModel._counter,
    };

  }

  public get layerSpec(): LayerSpec {
    return this._layerSpec;
  }

  public get changedAttributes(): Partial<LayerSpec> {
    return this._changedAttributes;
  }

  public get(key: keyof LayerSpec): LayerSpec[keyof LayerSpec] {
    return this._layerSpec[key];
  }

  public set(key: string, value: unknown): void {
    const newData: Partial<LayerSpec> = { [key]: value };
    this._layerSpec = {
      ...this._layerSpec,
      ...newData,
    };
  }

  public update(layerSpec: Partial<LayerSpec>): void {
    // resetting changedAttributes for every update
    const changedAttributes: Record<string, unknown> = {};

    Object.keys(layerSpec).forEach((key) => {
      const prev: LayerSpec[keyof LayerSpec] = this._layerSpec[key as keyof LayerSpec];
      const current: LayerSpec[keyof LayerSpec] = layerSpec[key as keyof LayerSpec];

      if (!isEqual(prev, current)) {
        changedAttributes[key] = current;
      }
    });

    this._changedAttributes = changedAttributes;
    this._layerSpec = {
      ...this._layerSpec,
      ...this._changedAttributes,
    };
  }

  public setLayerRequest(layerRequest: CancelTokenSource): void {
    this.layerRequest = layerRequest;
  }
}

export default LayerModel;
