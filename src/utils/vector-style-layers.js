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
    return (
      vectorLayersParsed &&
      vectorLayersParsed.map((vectorLayer, i) => {
        const PAINT_STYLE_NAMES = {
          symbol: ['icon', 'text'],
          circle: ['circle', 'circle-stroke']
        };

        // Select the paint property from the original layer
        const { paint = {} } = vectorLayer;

        // Select the style to change depending on the type of layer
        const opacityPaintNames = PAINT_STYLE_NAMES[vectorLayer.type] || [vectorLayer.type];

        const opacityPaintStyles = opacityPaintNames.reduce((obj, name) => {
          const currentProperty = paint[`${name}-opacity`];
          let paintOpacity = 0.99 * layerModel.opacity;

          if (currentProperty !== undefined && currentProperty !== null) {
            if (typeof currentProperty === 'number') {
              paintOpacity = currentProperty * layerModel.opacity * 0.99;
            }

            if (Array.isArray(currentProperty)) {
              paintOpacity = currentProperty.map(j => {
                if (typeof j === 'number') {
                  return j * layerModel.opacity * 0.99;
                }
                return j;
              });
            }
          }

          return {
            ...obj,
            [`${name}-opacity`]: paintOpacity
          };
        }, {});

        // if paint properties are null are passed it breaks interaction
        // on mapbox. We need to remove these
        const filteredPaintProperties =
          vectorLayer.paint &&
          Object.entries(vectorLayer.paint).reduce(
            (obj, [key, value]) => ({
              ...obj,
              ...(!!value && {
                [key]: value
              })
            }),
            {}
          );

        return {
          // id: This will avoid having issues with any layer, but you should specify an id when you create it.
          // If you don't set an id in the definition, and you set a fill-opacity, it won't work
          id: `${id}-${vectorLayer.type}-${i}`,
          ...vectorLayer,
          source: id,
          ...(vectorLayer.paint && {
            paint: {
              ...filteredPaintProperties,
              ...opacityPaintStyles
            }
          })
        };
      })
    );
  }

  return false;
};

export default { getVectorStyleLayers };
