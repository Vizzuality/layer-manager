import React from 'react';
import Map from 'components/map';
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager'

import './App.scss'

function App() {
  const layers = [{
    id: '74c4bb92-9799-45f5-9f4d-f44b76508ce8',
    layerConfig: {
      body: {
        sldValue: '<RasterSymbolizer><ColorMap type="ramp" extended="false" ><ColorMapEntry color="#ffffcc" quantity="0.6"  opacity="1" /><ColorMapEntry color="#c2e699" quantity="0.7" /><ColorMapEntry color="#78c679" quantity="0.8" /><ColorMapEntry color="#31a354" quantity="0.9"  /><ColorMapEntry color="#006837" quantity="1.0"  /></ColorMap></RasterSymbolizer>',
        styleType: 'sld'
      },
      assetId: 'users/resourcewatch/bio_014_bio_intactness',
      type: 'gee'
    },
    provider: 'gee',

    // params: PropTypes.shape({}),
    // sqlParams: PropTypes.shape({}),
    // decodeParams: PropTypes.shape({}),

    // opacity: PropTypes.number, // def 1
    // visibility: PropTypes.bool, // def true
    // zIndex: PropTypes.number, // def ~1000

    // layerManager: PropTypes.shape({})
  }];

  return (
    <div className="c-app">
      <Map
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/layer-manager/ck07vfinn01xm1co324q5vcdl"
      >
        {(map) =>
          <LayerManager
            map={map}
            plugin={PluginMapboxGl}
          >
            {layers.map(layer => (
              <Layer
                key={layer.id}
                {...layer}
              />
            ))}
          </LayerManager>
        }
      </Map>
    </div>
  );
}

export default App;
