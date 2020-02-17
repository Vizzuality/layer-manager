import React, { useState } from 'react';

// Components
import Map from 'components/map';
import Sidebar from 'components/sidebar';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

// Layer manager
import { LayerManager, Layer } from 'layer-manager/dist/components';
import { PluginMapboxGl } from 'layer-manager';

// Legend
import {
  Icons,
  Legend,
  LegendListItem,
  LegendItemTypes,
  LegendItemToolbar,
  LegendItemButtonOpacity,
  LegendItemButtonVisibility,
  LegendItemButtonRemove
} from 'vizzuality-components';

// DATA
import DEFAULT_LAYERS from './layers';

import './App.scss';

function App() {
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [layersJson, setLayersJson] = useState(JSON.stringify(DEFAULT_LAYERS, null, 2));

  const layerGroups = layers.map(l => {
    const { id } = l;

    return {
      slug: id,
      dataset: id,
      layers: [
        {
          active: true,
          ...l
        }
      ]
    };
  });

  const onChangeJson = json => {
    setLayersJson(json);

    try {
      const newLayers = JSON.parse(json);
      setLayers(newLayers);
    } catch (e) {
      // do nothing
    }
  };
  const onChangeOrder = (...props) => {
    console.log('onChangeOrder', props);
  };
  const onChangeVisibility = (...props) => {
    console.log('onChangeVisibility', props);
  };
  const onChangeOpacity = (...props) => {
    console.log('onChangeOpacity', props);
  };
  const onRemoveLayer = (...props) => {
    console.log('onRemoveLayer', props);
  };

  return (
    <div className="c-app">
      <Icons />

      <div className="c-main">
        <Sidebar>
          <AceEditor
            mode="json"
            theme="github"
            value={layersJson}
            onChange={onChangeJson}
            tabSize={2}
            width="100%"
            height="100%"
            wrapEnabled
            showPrintMargin={false}
            editorProps={{ $blockScrolling: true }}
            debounceChangePeriod={500}
          />
        </Sidebar>

        <div className="c-map-container">
          <Map
            mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
            mapStyle="mapbox://styles/layer-manager/ck07vfinn01xm1co324q5vcdl"
            minZoom={2}
          >
            {map => (
              <LayerManager map={map} plugin={PluginMapboxGl}>
                {layers.map(layer => (
                  <Layer key={layer.id} {...layer} {...layer.config} />
                ))}
              </LayerManager>
            )}
          </Map>

          <div className="c-legend">
            <Legend maxHeight={'65vh'} collapsable={false} onChangeOrder={onChangeOrder}>
              {layerGroups.map((layerGroup, i) => {
                return (
                  <LegendListItem
                    index={i}
                    key={layerGroup.slug}
                    layerGroup={layerGroup}
                    toolbar={
                      <LegendItemToolbar>
                        <LegendItemButtonOpacity
                          trackStyle={{
                            background: '#FFCC00'
                          }}
                          handleStyle={{
                            background: '#FFCC00'
                          }}
                        />
                        <LegendItemButtonVisibility />
                        <LegendItemButtonRemove />
                      </LegendItemToolbar>
                    }
                    onChangeVisibility={(l, visibility) =>
                      onChangeVisibility(l, visibility, layerGroup.slug)
                    }
                    onChangeOpacity={(l, opacity) => onChangeOpacity(l, opacity, layerGroup.slug)}
                    onRemoveLayer={l => {
                      onRemoveLayer(l);
                    }}
                  >
                    <LegendItemTypes />
                  </LegendListItem>
                );
              })}
            </Legend>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
