import { CancelTokenSource } from 'axios';
import isEqual from 'lodash/isEqual';

export type LayerSpec = {
  opacity?: number;
  visibility?: boolean;
  source?: any;
  render?: any;
};

const defaultLayerSpec: Partial<LayerSpec> = {
  opacity: 1,
  visibility: true,
};

export class Layer {
  readonly layerSpec: LayerSpec = defaultLayerSpec

  private changedAttributes: Partial<LayerSpec> = {}

  public layerRequest: CancelTokenSource | undefined = undefined

  constructor(layerSpec: LayerSpec) {
    if (!layerSpec) throw new Error('layerSpec object is required');

    this.layerSpec = {
      ...this.layerSpec,
      ...layerSpec,
    };
  }

  public get(key: keyof LayerSpec): LayerSpec {
    return this.layerSpec[key as keyof LayerSpec];
  }

  public set(key: keyof LayerSpec, value: any): void {
    this.layerSpec[key as keyof LayerSpec] = value;
  }

  public update(layerSpec: Partial<LayerSpec>): void {
    const prevData = this.layerSpec;
    const nextData = layerSpec;

    // resetting changedAttributes for every update
    this.changedAttributes = {};

    Object.keys(nextData).forEach(key => {
      if (!isEqual(prevData[key as keyof LayerSpec], nextData[key as keyof LayerSpec])) {
        this.changedAttributes[key as keyof LayerSpec] = nextData[key as keyof LayerSpec];
        this.layerSpec[key as keyof LayerSpec] = nextData[key as keyof LayerSpec];
      }
    });
  }

  public setLayerRequest(layerRequest: CancelTokenSource): void {
    this.layerRequest = layerRequest;
  }
}

export default Layer;
