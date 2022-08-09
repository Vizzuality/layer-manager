import { MapProvider } from 'react-map-gl';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  options: {
    storySort: {
      order: [
        'Intro',
        'Layer-Manager',
        ['Map', 'Plugin', 'Provider'],
        'Layer',
        [
          'Intro',
          'Attributtes',
          ['Id', 'Type', 'Source', 'Render', 'Images', 'Opacity', 'Visibility', 'Params', 'SqlParams', 'DecodeParams', 'DecodeFunction', 'OnAfterAdd', 'OnAfterRemove'],
        ],
        'Layers',
        ['Vector', 'Geojson', 'Raster']
      ],
    },
  },
}

export const decorators = [
  (MapStory) => (
    <MapProvider>
      <MapStory />
    </MapProvider>
  ),
];