import React from 'react';
import Map from 'components/map';
// import { LayerManager, Layer } from 'layer-manager/dist/components';
import { LayerManager, Layer } from '../../src/components';
// import { PluginMapboxGl } from 'layer-manager'
import { PluginMapboxGl } from '../../src/plugins/plugin-mapbox-gl'

import './App.scss'

function App() {
  const layers = [];

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
