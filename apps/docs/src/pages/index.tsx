import { LayerManager, Layer } from "@vizzuality/lm-react";
import PluginMapboxGL from "@vizzuality/lm-plugin-mapboxgl";

import { MapProvider } from 'react-map-gl';

import Map from "../components/map";

import 'mapbox-gl/dist/mapbox-gl.css';

export default function Docs() {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
      <MapProvider>
        <Map
          id="map"
          mapStyle='mapbox://styles/afilatore90/cjuvfwn1heng71ftijvnv2ek6'
          mapboxAccessToken={process.env.STORYBOOK_MAPBOX_API_TOKEN}
        >
          {(map) => {
            console.log(map);
            return (
              <LayerManager map={map} plugin={PluginMapboxGL}>
                <Layer
                  id="test"
                  type="raster"
                  source={{
                    type: 'raster',
                    tileSize: 256,
                    tiles: ['https://earthengine.google.org/static/hansen_2013/gain_alpha/{z}/{x}/{y}.png'],
                    minzoom: 3,
                    maxzoom: 12,
                  }}
                />
              </LayerManager>
            )
          }}
        </Map>
      </MapProvider>
    </div>
  );
}
