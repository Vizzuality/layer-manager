import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';

import { replace } from 'utils/query';

class Layer extends PureComponent {
  static propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.oneOf(['raster', 'vector', 'geojson']).isRequired,
    source: PropTypes.shape({
      parse: PropTypes.bool
    }).isRequired,

    render: (props, propName, componentName) => {
      const { type } = props;

      if (type === 'vector' && isEmpty(props[propName])) {
        return new Error(
          `The prop '${propName}' is marked as required in '${componentName}', but its value is {}`
        );
      }

      if (typeof props[propName] !== 'object') {
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
        getSource: PropTypes.func
      })
    })
  };

  static defaultProps = {
    params: undefined,
    sqlParams: undefined,
    decodeParams: undefined,
    opacity: 1,
    visibility: true,
    zIndex: undefined,

    render: {},

    layerManager: null,

    onAfterAdd: () => {},
    onAfterRemove: () => {}
  };

  componentDidMount() {
    this.add();
  }

  componentDidUpdate(prevProps) {
    const {
      source: prevSource,
      render: prevRender,
      params: prevParams,
      sqlParams: prevSqlParams,
      decodeParams: prevDecodeParams,
      opacity: prevOpacity,
      visibility: prevVisibility,
      zIndex: prevZIndex
    } = prevProps;

    const {
      type,
      source,
      render,
      params,
      sqlParams,
      decodeParams,
      opacity,
      visibility,
      zIndex
    } = this.props;

    // Check that source has changed
    const prevSourceParsed =
      prevSource.parse === false
        ? prevSource
        : JSON.parse(replace(JSON.stringify(prevSource), prevParams, prevSqlParams));

    const sourceParsed =
      source.parse === false
        ? source
        : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

    // Check that render has changed
    const prevRenderParsed =
      prevRender.parse === false
        ? prevRender
        : JSON.parse(replace(JSON.stringify(prevRender), prevParams, prevSqlParams));

    const renderParsed =
      render.parse === false
        ? render
        : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

    // TODO: don't add and remove if provider is geojson
    if (sourceParsed && !isEqual(sourceParsed, prevSourceParsed)) {
      const { type: sourceType, data } = sourceParsed;
      const t = sourceType || type;

      if (t === 'raster' || t === 'vector' || (t === 'geojson' && typeof data === 'string')) {
        this.remove();
        this.add();

        // prevent updating layer
        return;
      }
    }

    if (renderParsed && !isEqual(renderParsed, prevRenderParsed)) {
      const { layers = [] } = renderParsed;
      const { layers: prevLayers = [] } = prevRenderParsed;

      if (layers.length !== prevLayers.length) {
        this.remove();
        this.add();

        // prevent updating layer
        return;
      }
    }

    const changedProps = {
      ...(opacity !== prevOpacity && {
        opacity
      }),
      ...(visibility !== prevVisibility && {
        visibility
      }),
      ...(zIndex !== prevZIndex && {
        zIndex
      }),
      ...(!isEqual(sourceParsed, prevRenderParsed) && {
        source: sourceParsed
      }),
      ...(!isEqual(renderParsed, prevRenderParsed) && {
        render: renderParsed
      }),
      ...(!isEqual(decodeParams, prevDecodeParams) && {
        decodeParams
      })
    };

    if (!isEmpty(changedProps)) {
      this.update(changedProps);
    }
  }

  componentWillUnmount() {
    this.remove();
  }

  add = () => {
    const { layerManager, onAfterAdd, ...props } = this.props;
    const { source, render, params, sqlParams } = props;

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
        ...props,
        source: sourceParsed,
        render: renderParsed
      },
      {},
      onAfterAdd
    );
  };

  update = changedProps => {
    const { layerManager, id } = this.props;

    layerManager.update(id, changedProps);
  };

  remove = () => {
    const { layerManager, id, onAfterRemove } = this.props;
    layerManager.remove(id, onAfterRemove);
  };

  render() {
    return null;
  }
}

export default Layer;
