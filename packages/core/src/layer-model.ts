import isEqual from 'fast-deep-equal/es6';
// @ts-ignore
import { compare } from 'js-deep-equals';

import type { CancelTokenSource } from 'axios';
import type { LayerSpec } from '../types';

const defaultLayerSpec: Partial<LayerSpec> = {
  opacity: 1,
  visibility: true,
};

class LayerModel {
  private _uid: number; // for internal purposes

  static _counter = 0;

  private _changedAttributes: Partial<LayerSpec> = {};

  public layerRequest: CancelTokenSource | undefined = undefined;

  public mapLayer: any; // depends on the plugin

  constructor(private _layerSpec: LayerSpec) {
    if (!_layerSpec) throw new Error('layerSpec object is required');

    // updating counter for internal purposes
    LayerModel._counter += 1;

    this._layerSpec = {
      ...defaultLayerSpec,
      ..._layerSpec,
    };

    this._uid = LayerModel._counter;
  }

  public get uid(): LayerModel['_uid'] {
    return this._uid;
  }

  public get id(): LayerSpec['id'] {
    return this._layerSpec.id;
  }

  public get type(): LayerSpec['type'] {
    return this._layerSpec.type;
  }

  public get visibility(): LayerSpec['visibility'] {
    return this._layerSpec.visibility;
  }

  public get opacity(): LayerSpec['opacity'] {
    return this._layerSpec.opacity;
  }

  public get zIndex(): LayerSpec['zIndex'] {
    return this._layerSpec.zIndex;
  }

  public get images(): LayerSpec['images'] {
    return this._layerSpec.images;
  }

  public get render(): LayerSpec['render'] {
    return this._layerSpec.render;
  }

  public get source(): LayerSpec['source'] {
    return this._layerSpec.source;
  }

  public get interactivity(): LayerSpec['interactivity'] {
    return this._layerSpec.interactivity;
  }

  public get params(): LayerSpec['params'] {
    return this._layerSpec.params;
  }

  public get sqlParams(): LayerSpec['sqlParams'] {
    return this._layerSpec.sqlParams;
  }

  public get deck(): LayerSpec['deck'] {
    return this._layerSpec.deck;
  }

  public get layerSpec(): LayerSpec {
    return this._layerSpec;
  }

  public get changedAttributes(): Partial<LayerSpec> {
    return this._changedAttributes;
  }

  public setMapLayer(mapLayer: unknown): void {
    this.mapLayer = mapLayer;
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

      // Deep comparison for deck layers
      if (key === 'deck' && !compare(prev, current)) {
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
