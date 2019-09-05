import React from 'react';
import Map from 'components/map';

import './App.scss'

function App() {
  return (
    <div className="c-app">
      <Map
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        mapStyle="mapbox://styles/layer-manager/ck06v389m02u61cqq3qqd78hq"
      >
        {(map) => {
          // Layer Manager goes here
        }}
      </Map>
    </div>
  );
}

export default App;
