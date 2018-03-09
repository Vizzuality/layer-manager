import { expect } from 'chai';
import { LayerManagerLeaflet } from '../../src/index';
import layerSpec from '../mocks/layer';
import moreLayerSpec from '../mocks/more-layers';

describe('LayerManager for Leaflet', () => {
  let map, lm;

  // Preparing Leaflet and creating map
  before((done) => {
    window.onload = () => {
      global.L = window.L;
      const mapElement = document.getElementById('map_canvas');
      map = L.map(mapElement).setView([40, -3], 5);
      lm = new LayerManagerLeaflet(map);
      done();
    };
  });

  describe('# Initialization', () => {
    it('should be an instance of LayerManagerLeaflet', () => {
      expect(lm).to.be.instanceOf(LayerManagerLeaflet);
    });
  });

  describe('# Adding and finding', () => {
    it('should be added 10 layers', () => {
      lm.add(layerSpec);
      expect(lm.layers).to.be.an('array');
      expect(lm.layers.length).to.be.equal(10);
    });

    it('should get one specific layer by id', () => {
      const layer = lm.find('29ce6221-9450-4b60-a9c2-aea581d31a08');
      expect(layer).to.be.an('object');
      expect(layer.id).to.be.equal('29ce6221-9450-4b60-a9c2-aea581d31a08');
    });

    it('should return undefined when id doesn`t exist', () => {
      const layer = lm.find('29ce6221-9450-4b60-a9c2');
      expect(layer).to.be.undefined;
    });

    it('should return 15 layers when adding more layers', () => {
      lm.add(moreLayerSpec);
      expect(lm.layers.length).to.be.equal(15);
    });
  });
});
