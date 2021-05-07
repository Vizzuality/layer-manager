import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import { replace } from "@vizzuality/layer-manager-utils";

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const Layer = (props) => {
  const add = () => {
    const { layerManager, onAfterAdd, ...moreProps } = props;
    const { source, render, params, sqlParams } = moreProps;

    const sourceParsed =
      source.parse === false
        ? source
        : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

    const renderParsed =
      render.parse === false
        ? render
        : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

    layerManager.add(
      {
        ...moreProps,
        source: sourceParsed,
        render: renderParsed,
      },
      {},
      onAfterAdd
    );
  };

  const update = (changedProps) => {
    const { layerManager, id } = props;

    layerManager.update(id, changedProps);
  };

  const remove = () => {
    const { layerManager, id, onAfterRemove } = props;

    layerManager.remove(id, onAfterRemove);
  };

  useEffect(() => {
    add();
    return remove();
  }, []);

  const {
    type,
    source,
    render,
    params,
    sqlParams,
    decodeParams,
    opacity,
    visibility,
    zIndex,
  } = props;

  const prevSource = usePrevious(source);
  const prevRender = usePrevious(render);
  const prevParams = usePrevious(params);
  const prevSqlParams = usePrevious(sqlParams);
  const prevDecodeParams = usePrevious(decodeParams);
  const prevOpacity = usePrevious(opacity);
  const prevVisibility = usePrevious(visibility);
  const prevZIndex = usePrevious(zIndex);

  // TODO: split into different effects. React batch update should take care of this and we should call a single update()
  useEffect(() => {
    const prevSourceParsed =
      prevSource.parse === false
        ? prevSource
        : JSON.parse(
            replace(JSON.stringify(prevSource), prevParams, prevSqlParams)
          );

    const sourceParsed =
      source.parse === false
        ? source
        : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

    // Check that render has changed
    const prevRenderParsed =
      prevRender.parse === false
        ? prevRender
        : JSON.parse(
            replace(JSON.stringify(prevRender), prevParams, prevSqlParams)
          );

    const renderParsed =
      render.parse === false
        ? render
        : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

    // TODO: don't add and remove if provider is geojson
    if (sourceParsed && !isEqual(sourceParsed, prevSourceParsed)) {
      const { type: sourceType, data } = sourceParsed;
      const t = sourceType || type;

      if (
        t === "raster" ||
        t === "vector" ||
        (t === "geojson" && typeof data === "string")
      ) {
        remove();
        add();

        // prevent updating layer
        return;
      }
    }

    if (renderParsed && !isEqual(renderParsed, prevRenderParsed)) {
      const { layers = [] } = renderParsed;
      const { layers: prevLayers = [] } = prevRenderParsed;

      if (layers.length !== prevLayers.length) {
        remove();
        add();

        // prevent updating layer
        return;
      }
    }

    const changedProps = {
      ...(opacity !== prevOpacity && {
        opacity,
      }),
      ...(visibility !== prevVisibility && {
        visibility,
      }),
      ...(zIndex !== prevZIndex && {
        zIndex,
      }),
      ...(!isEqual(sourceParsed, prevRenderParsed) && {
        source: sourceParsed,
      }),
      ...(!isEqual(renderParsed, prevRenderParsed) && {
        render: renderParsed,
      }),
      ...(!isEqual(decodeParams, prevDecodeParams) && {
        decodeParams,
      }),
    };

    if (!isEmpty(changedProps)) {
      update(changedProps);
    }
  }, [
    type,
    source,
    render,
    params,
    sqlParams,
    decodeParams,
    opacity,
    visibility,
    zIndex,
  ]);

  return null;
};

export default Layer;

Layer.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  type: PropTypes.oneOf(["raster", "vector", "geojson"]).isRequired,
  source: PropTypes.shape({
    parse: PropTypes.bool,
  }).isRequired,
  render: (props, propName, componentName) => {
    const { type } = props;

    if (type === "vector" && isEmpty(props[propName])) {
      return new Error(
        `The prop '${propName}' is marked as required in '${componentName}', but its value is {}`
      );
    }

    if (typeof props[propName] !== "object") {
      return new Error(
        `Invalid prop '${propName}' of type '${typeof props[
          propName
        ]}' supplied to '${componentName}', expected 'object'.`
      );
    }

    return null;
  },

  params: PropTypes.shape({}),
  sqlParams: PropTypes.shape({}),
  decodeParams: PropTypes.shape({}),

  opacity: PropTypes.number,
  visibility: PropTypes.bool,
  zIndex: PropTypes.number,

  onAfterAdd: PropTypes.func,
  onAfterRemove: PropTypes.func,

  layerManager: PropTypes.shape({
    add: PropTypes.func.isRequired,
    update: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
    map: PropTypes.shape({
      getSource: PropTypes.func,
    }),
  }),
};

Layer.defaultProps = {
  params: undefined,
  sqlParams: undefined,
  decodeParams: undefined,
  opacity: 1,
  visibility: true,
  zIndex: undefined,
  render: {},
  layerManager: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onAfterAdd: () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onAfterRemove: () => {},
};
