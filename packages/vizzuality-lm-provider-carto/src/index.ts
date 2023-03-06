import { fetch, omit } from '@vizzuality/lm-utils';

import type {
  LayerModel, LayerSpec, Source, ProviderMaker,
} from '@vizzuality/lm';
import type {
  CartoData, CartoParams, CartoLayer, CartoProvider,
} from '../types';

/**
 * Specify how to get the data and the layers for this provider
 * @param layerModel Instance of LayerModel
 * @param resolve Object
 * @param reject Function
 */
class CartoProviderMaker implements ProviderMaker {
  /**
   * REQUIRED
   * A name (key) for the provider.
   * Use the same name you will use in your layerSpec object.
   */
  public name = 'carto';

  public handleData = (
    layerModel: LayerModel,
    layer: LayerSpec,
    resolve?: (layerSpec: LayerSpec) => void,
    reject?: (err: Error) => void,
  ): void => {
    const { interactivity, source, type } = layerModel;
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
      }),
    });

    // https://carto.com/developers/auth-api/guides/how-to-send-API-Keys/
    const apiParams: CartoParams = {
      stat_tag: 'API',
      config: encodeURIComponent(layerTpl),
      ...(cartoProvider.api_key && { api_key: cartoProvider.api_key }),
    };
    const apiParamsString = Object.keys(apiParams)
      .map((k) => `${k}=${apiParams[k as keyof CartoParams]}`)
      .join('&');
    const url = `https://${cartoProvider.account}.carto.com/api/v1/map?${apiParamsString}`;

    fetch('get', url, {}, layerModel)
      .then((data: unknown) => {
        const cartoData = data as CartoData;
        const ext = type === 'vector' ? 'mvt' : 'png';
        const tileUrl = `${cartoData.cdn_url.templates.https.url.replace('{s}', 'a')}/${
          cartoProvider.account
        }/api/v1/map/${cartoData.layergroupid}/{z}/{x}/{y}.${ext}`;
        const result = {
          ...layer,
          source: {
            ...omit('provider', layer.source),
            tiles: [tileUrl],
          } as Source,
        };

        if (resolve) resolve(result);
      })
      .catch((err: Error) => {
        if (reject) reject(err);
      });
  };
}

export default CartoProviderMaker;
