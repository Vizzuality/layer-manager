import { LayerModel } from '@vizzuality/layer-manager';
import CartoProvider from '../src/carto-provider';

const LAYER_SPEC = {
  id: 'protected-areas',
  name: 'Protected areas',
  type: 'vector',
  source: {
    type: 'vector',
    promoteId: 'cartodb_id',
    provider: {
      type: 'carto',
      account: 'wri-01',
      layers: [
        {
          options: {
            cartocss: '#wdpa_protected_areas {  polygon-opacity: 1.0; polygon-fill: #704489 }',
            cartocss_version: '2.3.0',
            sql: 'SELECT * FROM wdpa_protected_areas'
          },
          type: 'mapnik'
        }
      ]
    }
  },
  render: {
    layers: [
      {
        type: 'fill',
        'source-layer': 'layer0',
        featureState: {},
        paint: {
          'fill-color': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            '#000',
            '#5ca2d1'
          ],
          'fill-color-transition': {
            duration: 300,
            delay: 0
          },
          'fill-opacity': 1
        }
      },
      {
        type: 'line',
        'source-layer': 'layer0',
        paint: {
          'line-color': '#000000',
          'line-opacity': 0.1
        }
      }
    ]
  },
  paramsConfig: [],
};

const LAYER_RESULT = {
  ...LAYER_SPEC,
  source: {
    promoteId: 'cartodb_id',
    tiles: [
      'https://cartocdn-gusc-a.global.ssl.fastly.net/wri-01/api/v1/map/487c0089ed193790cae385eec498b239:1549530042384/{z}/{x}/{y}.mvt'
    ],
    type: 'vector',
  },
  opacity: 1,
  visibility: true,
}

describe('Carto Provider', () => {
  const cartoProvider = new CartoProvider();
  const layerModel = new LayerModel(JSON.parse(JSON.stringify(LAYER_SPEC)));

  it('should be a class', () => {
    expect(cartoProvider).toBeInstanceOf(CartoProvider);
  });

  it('should have the name "carto"', () => {
    expect(cartoProvider.name).toEqual('carto');
  });

  it('should have a method called "handleData"', () => {
    expect(typeof cartoProvider.handleData).toBe('function');
  })

  it('handleData should request a layer', (done) => {
    cartoProvider.handleData(
      layerModel,
      layerModel.layerSpec,
      (layerModelResult) => {
        try {
          expect(layerModelResult).toEqual(LAYER_RESULT);
          done();
        } catch(err) {
          done(err);
        }
      },
    );
  });
});
