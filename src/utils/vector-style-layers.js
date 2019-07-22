import { replace } from './query';

/**
 * Parsed vector style layers that follow the mapbox style layer spec
 * and returns mountable layers with ids and opacity applied
 * @param {Array} vectorLayers
 * @param {Object} layerModel
 */
export const getVectorStyleLayers = (vectorLayers, layerModel) => {
  const { id, params, sqlParams } = layerModel;
  if (vectorLayers && vectorLayers.length) {
    const vectorLayersParsed = JSON.parse(replace(JSON.stringify(vectorLayers), params, sqlParams));
    return vectorLayersParsed && vectorLayersParsed.map((l, i) => {
      const PAINT_STYLE_NAMES = {
        symbol: ['icon', 'text'],
        circle: ['circle', 'circle-stroke']
      };

      // Select the paint property from the original layer
      const { paint = {} } = l;

      // Select the style to change depending on the type of layer
      const opacityPaintNames = PAINT_STYLE_NAMES[l.type] || [l.type];

      const opacityPaintStyles = opacityPaintNames.reduce((obj, name) => {
        const paintOpacity = paint[`${name}-opacity`] || 1;

        return {
          ...obj,
          [`${name}-opacity`]: paintOpacity * layerModel.opacity * 0.99
        };
      }, {});

      // if paint properties or null are passed it breaks interaction
      // on mapbox. We need to remove these
      const filteredPaintProperties = l.paint && Object.entries(l.paint).reduce((obj, arr) => ({
        ...obj,
        ...!!arr[1] && {
          [arr[0]]: arr[1]
        }
      }), {});

      return {
        // id: This will avoid having issues with any layer, but you should specify an id when you create it.
        // If you don't set an id in the definition, and you set a fill-opacity, it won't work
        id: `${id}-${l.type}-${i}`,
        ...l,
        source: id,
        ...l.paint && {
          paint: {
            ...filteredPaintProperties,
            ...opacityPaintStyles
          }
        }
      };
    });
  }

  return false;
};

export default { getVectorStyleLayers };
