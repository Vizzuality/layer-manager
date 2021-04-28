# DecodeLayer

The DecodeLayer renders a decode at specified boundaries.

```js
import {DecodeLayer} from '@deck.gl/experimental-layers';

const App = ({data, viewport}) => {

  const layer = new DecodeLayer({
    id: 'decode-layer',
    image: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
    bounds: [
      [-71.516, 37.936],
      [-80.425, 37.936],
      [-80.425, 46.437],
      [-71.516, 46.437]
    ],
    desaturate: 0,
    transparentColor: [0, 0, 0, 0],
    tintColor: [255, 255, 255]
  });

  return (<DeckGL {...viewport} layers={[layer]} />);
}
```

## Properties

### Data

##### `decode` (String|Texture2D|Image|HTMLCanvasElement)

- Default `null`.

##### `bounds` (Array)

Supported formats:
- Coordinates of the bounding box of the decode `[minX, minY, maxX, maxY]`
- Coordinates of four corners of the decode, should follow the sequence of `[[minX, minY], [minX, maxY], [maxX, maxY], [maxX, minY]]`
each position could be `[x, y]` or `[x, y, z]` format.

### Render Options

##### `desaturate` (Number)

- Default `0`

The desaturation of the decode. Between `[0, 1]`. `0` being the original color and `1` being grayscale.

##### `transparentColor` (Array)

- Default `[0, 0, 0, 0]`

The color to use for transparent pixels, in `[r, g, b, a]`. Each component is in the `[0, 255]` range.

More context: because of the blending mode we're using for ground imagery, alpha is not effective when blending the decode layers with the base map. Instead we need to manually dim/blend rgb values with a background color.

##### `tintColor` (Array)

- Default `[255, 255, 255]`

The color to tint the decode by, in `[r, g, b]`. Each component is in the `[0, 255]` range.

