/**
 * Parsed vector style layers that follow the mapbox style layer spec
 * and returns mountable layers with ids and opacity applied
 * @param {Array} vectorLayers
 * @param {Object} layerModel
 */
export const getVectorStyleLayers = (vectorLayers, layerModel) => {
  const { id } = layerModel;

  return vectorLayers.map((l, i) => {
    const layerOpacity = l.opacity ? layerModel.opacity * l.opacity : layerModel.opacity;
    let opacityPaintTypes = [l.type];
    if (l.type === 'symbol') opacityPaintTypes = ['icon', 'text'];
    if (l.type === 'circle') opacityPaintTypes = ['circle', 'circle-stroke'];
    const opacityPaintStyles = opacityPaintTypes.reduce((obj, type) => ({
      ...obj,
      [`${type}-opacity`]: layerOpacity
    }), {});

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
};

export default { getVectorStyleLayers };
