import React, { useState } from 'react';
import Map from 'components/map';
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager'
import layers from 'layers.json';

import LayerToggle from 'components/map/controls/layer-toggle';

import './App.scss'

function App() {
  const [activeLayers, setActiveLayers] = useState(layers.map(l => ({...l, active: true})));

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
            {activeLayers.filter(l => l.active).map(layer => (
              <Layer
                key={layer.id}
                {...layer}
              />
            ))}
          </LayerManager>
        }
      </Map>
      <LayerToggle layers={activeLayers} setLayers={setActiveLayers} />
    </div>
  );
}

export default App;
