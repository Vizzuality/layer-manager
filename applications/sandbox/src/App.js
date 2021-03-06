import React, { useState } from 'react';

import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';

// Components
import Map from 'components/map';
import Sidebar from 'components/sidebar';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';

import { LayerManager, Layer } from '@vizzuality/layer-manager-react';
import { fetch } from '@vizzuality/layer-manager-utils';
import PluginMapboxGl from '@vizzuality/layer-manager-plugin-mapboxgl';
import CartoProvider from '@vizzuality/layer-manager-provider-carto';

// Legend
import {
  Icons,
  Legend,
  LegendListItem,
  LegendItemTypes,
  LegendItemTimeStep,
  LegendItemToolbar,
  LegendItemButtonOpacity,
  LegendItemButtonVisibility
} from 'vizzuality-components';
import { getParams } from './utils';

// DATA
import DEFAULT_LAYERS from './layers';

import './App.scss';

const cartoProvider = new CartoProvider();

function App() {
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [layersJson, setLayersJson] = useState(JSON.stringify(DEFAULT_LAYERS, null, 2));
  const [layersSettings, setLayersSettings] = useState({});
  const [layersInteractiveIds, setLayersInteractiveIds] = useState([]);

  // LEGEND
  const layerGroups = layers.map(l => {
    const { id, paramsConfig, sqlConfig, decodeConfig, timelineConfig } = l;
    const lSettings = layersSettings[id] || {};

    const params = !!paramsConfig && getParams(paramsConfig, lSettings.params);
    const sqlParams = !!sqlConfig && getParams(sqlConfig, lSettings.sqlParams);
    const decodeParams =
      !!decodeConfig && getParams(decodeConfig, { ...timelineConfig, ...lSettings.decodeParams });
    const timelineParams = !!timelineConfig && {
      ...timelineConfig,
      ...getParams(paramsConfig, lSettings.params),
      ...getParams(decodeConfig, lSettings.decodeParams)
    };

    return {
      id,
      slug: id,
      dataset: id,
      layers: [
        {
          active: true,
          ...l,
          ...lSettings,
          params,
          sqlParams,
          decodeParams,
          timelineParams
        }
      ],
      ...lSettings
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

  const onChangeOrder = () => {
    // console.info('onChangeOrder', ids);
  };

  const onChangeVisibility = (l, visibility) => {
    setLayersSettings({
      ...layersSettings,
      [l.id]: {
        ...layersSettings[l.id],
        visibility
      }
    });
  };

  const onChangeOpacity = (l, opacity) => {
    setLayersSettings({
      ...layersSettings,
      [l.id]: {
        ...layersSettings[l.id],
        opacity
      }
    });
  };

  const onChangeLayerDate = (dates, layer) => {
    const { id, decodeConfig } = layer;

    setLayersSettings({
      ...layersSettings,
      [id]: {
        ...layersSettings[id],
        ...(decodeConfig && {
          decodeParams: {
            startDate: dates[0],
            endDate: dates[1],
            trimEndDate: dates[2]
          }
        }),
        ...(!decodeConfig && {
          params: {
            startDate: dates[0],
            endDate: dates[1]
          }
        })
      }
    });
  };

  const onAfterAdd = layerModel => {
    if (!isEmpty(layerModel.layerSpec.interactionConfig)) {
      layerModel.mapLayer.layers.forEach(l => {
        const { id } = l;

        if (!layersInteractiveIds.includes(id)) {
          setLayersInteractiveIds(prevLayersInteractiveIds => [...prevLayersInteractiveIds, id]);
        }
      });
    }
  };

  const onAfterRemove = layerModel => {
    if (!isEmpty(layerModel.layerSpec.interactionConfig)) {
      layerModel.mapLayer.layers.forEach(l => {
        const { id } = l;

        if (layersInteractiveIds.includes(id)) {
          setLayersInteractiveIds(prevLayersInteractiveIds => {
            const arr = prevLayersInteractiveIds.filter(e => e !== id);

            return arr;
          });
        }
      });
    }
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
            // mapStyle="mapbox://styles/layer-manager/ck07vfinn01xm1co324q5vcdl"
            minZoom={2}
            mapOptions={{
              fadeDuration: 0
            }}
            bounds={{
              bbox: [
                -123.4808349609375,
                36.37264499608118,
                -120.7672119140625,
                38.61687046392973
              ]
            }}
            interactiveLayerIds={layersInteractiveIds}
          >
            {map => (
              <LayerManager
                map={map}
                plugin={PluginMapboxGl}
                providers={{
                  [cartoProvider.name]: cartoProvider.handleData,
                  'carto-sql-points': (layerModel, layer, resolve, reject) => {
                    const { source } = layerModel;
                    const { provider } = source;

                    fetch('get', provider.url, provider.options, layerModel)
                      .then(response => {
                        return resolve({
                          ...layer,
                          source: {
                            ...omit(layer.source, 'provider'),
                            data: {
                              type: 'FeatureCollection',
                              features: response.rows.map(r => ({
                                type: 'Feature',
                                properties: r,
                                geometry: {
                                  type: 'Point',
                                  coordinates: [r.lon, r.lat]
                                }
                              }))
                            }
                          }
                        });
                      })
                      .catch(e => {
                        reject(e);
                      });
                  }
                }}
              >
                {layers.map(layer => {
                  const {
                    id,
                    paramsConfig,
                    sqlConfig,
                    decodeConfig,
                    timelineConfig,
                    decodeFunction
                  } = layer;

                  const lSettings = layersSettings[id] || {};

                  const l = {
                    ...layer,
                    ...layer.config,
                    ...lSettings,
                    ...(!!paramsConfig && {
                      params: getParams(paramsConfig, { ...lSettings.params })
                    }),

                    ...(!!sqlConfig && {
                      sqlParams: getParams(sqlConfig, { ...lSettings.sqlParams })
                    }),

                    ...(!!decodeConfig && {
                      decodeParams: getParams(decodeConfig, {
                        ...timelineConfig,
                        ...lSettings.decodeParams
                      }),
                      decodeFunction
                    })
                  };

                  return (
                    <Layer
                      key={layer.id}
                      {...l}
                      onAfterAdd={onAfterAdd}
                      onAfterRemove={onAfterRemove}
                    />
                  );
                })}
              </LayerManager>
            )}
          </Map>

          <div className="c-legend">
            <Legend
              maxHeight="65vh"
              collapsable={false}
              sortable={false}
              onChangeOrder={onChangeOrder}
            >
              {layerGroups.map((layerGroup, i) => {
                return (
                  <LegendListItem
                    index={i}
                    key={layerGroup.slug}
                    layerGroup={layerGroup}
                    toolbar={(
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
                      </LegendItemToolbar>
                    )}
                    onChangeVisibility={onChangeVisibility}
                    onChangeOpacity={onChangeOpacity}
                  >
                    <LegendItemTypes />

                    <LegendItemTimeStep
                      defaultStyles={{
                        handleStyle: {
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.29)',
                          border: '0px',
                          zIndex: 2
                        },
                        railStyle: { backgroundColor: '#d6d6d9' },
                        dotStyle: { visibility: 'hidden', border: '0px' }
                      }}
                      handleChange={onChangeLayerDate}
                    />
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
