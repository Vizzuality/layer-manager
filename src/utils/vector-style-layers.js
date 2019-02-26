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
      let opacityPaintTypes = [l.type];
      if (l.type === 'symbol') opacityPaintTypes = ['icon', 'text'];
      if (l.type === 'circle') opacityPaintTypes = ['circle', 'circle-stroke'];

      const opacityPaintStyles = opacityPaintTypes.reduce((obj, type) => {
        const paintOpacity = l.paint && l.paint[`${type}-opacity`];

        return {
          ...obj,
          [`${type}-opacity`]: paintOpacity ? layerModel.opacity * paintOpacity : layerModel.opacity
        };
      }, {});

      return {
        ...l,
        id: `${id}-${l.type}-${i}`,
        source: id,
        ...l.paint && {
          paint: {
            ...l.paint,
            ...opacityPaintStyles
          }
        }
      };
    });
  }

  return false;
};

export default { getVectorStyleLayers };
