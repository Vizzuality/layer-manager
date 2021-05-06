# Migration to Layer Manager 3.x

## FAQ

> What's new in version 3 that should push me to migrate?

Computational performance reasons. Until now (v2) layer's `body` prop had things related to the source of the layer together with styling. That means that any change done to the styling of the layers would also unnecessarily refetch the layers (because of the props related to the source of the layer living in the same place as styling).
Another feature in version 3 is that you'll be able to display vector tile layers that are served from a generic source.
There's also more intuitive props naming as a bonus :tada:

> How long will it take me to migrate?

That depends on your familiarity with the Layer Manager and also the size of your application. You should also consider what is your application's workflow. Think of stuff like:
* Do you fetch your datasets and layers from the external API and consume the layer configs from there? (ex. resource-watch API) - you need to coordinate with your data team members so they will update the datasets and layers accordingly on their side.
* Do you store any IDs to the datasets and layers in your codebase? You will need to update them in order to fetch v3 datasets and layers. Most can be upgraded with find-and-replace technique.
* If all your layer configs live in your codebase, then the migration can be done solely on the frontend.
* Are you currently using leaflet plugin from Layer Manager v2? You'll need to switch to Mapbox specification as in LMv3, only this plugin is available.
If your application is small enough and has a couple of layers, you can assume it'll take you 2-3 days or even less :clock:. Large apps that have dependencies on the external API need to estimate for longer periods of time.


## `<LayerManager />` component

|    v2    |      v3      |
|----------|:-------------:
| map |  map|
| plugin |    plugin  |
| ❌ onLayerLoading | - |
| - | ✅ providers


`Table legend`

❌ - removed in version 3

✅ - added in version 3

The LayerManager component API specification hasn't changed a lot so start with removing the props that no longer exist.
`providers` prop is a new prop that you'll need to add in your application if you're using a provider that is not supported by Mapbox. If you're using this prop, make sure you import `fetch` function from the LayerManager as well. Check above for further details.


## `<Layer />` component

| v2                                                                         | v3                                                                                             |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| id                                                                         | id                                                                                             |
| ❌ layerConfig                                                             | ✅source                                                                                       |
| -                                                                          | ✅render                                                                                       |
| -                                                                          | ✅images                                                                                       |
- | ✅ type
| params                                                                     | params                                                                                         |
| sqlParams                                                                  | sqlParams                                                                                      |
| decodeParams                                                               | decodeParams                                                                                   |
| opacity                                                                    | opacity                                                                                        |
| visibility                                                                 | visibility                                                                                     |
| zIndex                                                                     | zIndex                                                                                         |
| -                                                                          | ✅onAfterAdd                                                                                   |
| -                                                                          | ✅onAfterRemove                                                                                |
| layerManager                                                               | layerManager                                                                                   |


`Table legend`

❌ - removed in version 3

✅ - added in version 3

In terms of the `<Layer />` component, when migrating to version 3:
* make sure to clean the code from the `layerConfig` prop and then `layerConfig.body` key (`<Layer layerConfig={...} />`)
* `layerConfig.body` becomes `source` and `render`:
`layerConfig.body` ➡ `source`, `render`

  `<Layer layerConfig={{ body: { ... } }} />`

    ➡

  `<Layer source={...} render={...} />`

  Move from `body` anything that relates to the way that the layer is fetched (url, provider, type) to the new `source` prop. The content of `source` is passed into the mapbox inside LayerManager so check in [mapbox documentation](https://docs.mapbox.com/mapbox-gl-js/style-spec/sources/) what props are supported.

  Anything that relates to styling the layer should go into `render` prop. `render` is optional because for raster layers it's not mandatory to define styles, although for vector type layers it is crucial to provide. Look for `vectorLayers` ocurrences in your code.
  `layerConfig.body.vectorLayers` becomes `render.layers` in this case.

  ```
  // v2
    <Layer
      layerConfig={{
        body: {
          vectorLayers: [
            { ... },
            { ... }
          ]
        },
        ...
      }}
    />
  ```
   ➡

  ```
  // v3
    <Layer
      render={{
        layers: [
          { ... },
          { ... }
        ]
      }}
    />
  ```

  ```
  render: {
    layers: <content of v2 vectorLayers>
  }
  ```
* If there is a `provider` key on the `layerConfig` level, it should be moved to the `source` object.


That should be it!
