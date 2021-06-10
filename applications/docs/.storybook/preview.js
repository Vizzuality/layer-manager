
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
        ['Id', 'Type', 'Source', 'Render', 'Images', 'Opacity', 'Visibility', 'Params', 'SqlParams', 'DecodeParams', 'DecodeFunction', 'OnAfterAdd', 'OnAfterRemove'],
        'Layers',
        ['Vector', 'Geojson', 'Raster']
      ],
    },
  }
}