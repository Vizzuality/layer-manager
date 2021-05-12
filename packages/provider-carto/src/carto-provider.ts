import { LayerModel, LayerSpec, Source } from '@vizzuality/layer-manager';
import { fetch } from '@vizzuality/layer-manager-utils';
import omit from 'lodash/omit';

export type CartoData = {
  cdn_url: {
    templates: {
      https: {
        url: string
      }
    }
  }
  layergroupid: string
}

export type CartoLayer = {
  options: Record<string, unknown>
  interactivity: unknown
}

export type CartoProvider = {
  account: string
  api_key: string
  layers: CartoLayer[]
  options?: Record<string, unknown>
  type: 'carto'
}

export type CartoParams = {
  stat_tag: 'API'
  config: string
  api_key?: string
}

export default {
  carto: (
    layerModel: LayerModel,
    resolve: (layerSpec: LayerSpec) => void,
    reject: (err: Error) => void,
  ): void => {
    const { layerSpec } = layerModel;
    const { interactivity, source } = layerSpec;
    const { provider } = source as Source;
    const cartoProvider = provider as CartoProvider;

    const layerTpl = JSON.stringify({
      version: '1.3.0',
      stat_tag: 'API',
      layers: cartoProvider.layers.map((l): CartoLayer => {
        if (!!interactivity && interactivity.length) {
          return { ...l, options: { ...l.options, interactivity } };
        }
        return l;
      })
    });

    // https://carto.com/developers/auth-api/guides/how-to-send-API-Keys/
    const apiParams: CartoParams = {
      stat_tag: 'API',
      config: encodeURIComponent(layerTpl),
      ...(cartoProvider.api_key && { api_key: cartoProvider.api_key })
    };
    const apiParamsString = Object.keys(apiParams)
      .map(k => `${k}=${apiParams[k as keyof CartoParams]}`)
      .join('&');
    const url = `https://${cartoProvider.account}.carto.com/api/v1/map?${apiParamsString}`;

    fetch('get', url, {}, layerModel)
      .then((response) => {
        const data: CartoData = response.data;
        const ext = layerSpec.type === 'vector' ? 'mvt' : 'png';
        const tileUrl = `${data.cdn_url.templates.https.url.replace('{s}', 'a')}/${
          cartoProvider.account
        }/api/v1/map/${data.layergroupid}/{z}/{x}/{y}.${ext}`;
        const result = {
          ...layerSpec,
          source: {
            ...omit(layerSpec.source, 'provider'),
            tiles: [tileUrl]
          } as Source
        };

        resolve(result);
      })
      .catch(err => reject(err));
  }
};
