import { PureComponent } from 'react';
import isEqual from 'fast-deep-equal/react';
import { isEmpty, replace } from '@vizzuality/layer-manager-utils';
import LayerManager, { LayerSpec } from '@vizzuality/layer-manager';

type LayerProps = LayerSpec & {
  layerManager: LayerManager
};

class Layer extends PureComponent<LayerProps> {
  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    params: undefined,
    sqlParams: undefined,
    decodeParams: undefined,
    opacity: 1,
    visibility: true,
    zIndex: undefined,
    source: {},
    render: {},
    onAfterAdd: () => null,
  };

  componentDidMount(): void {
    this.add();
  }

  componentDidUpdate(prevProps: Partial<LayerProps>): void {
    const {
      source: prevSource,
      render: prevRender,
      params: prevParams,
      sqlParams: prevSqlParams,
      decodeParams: prevDecodeParams,
      opacity: prevOpacity,
      visibility: prevVisibility,
      zIndex: prevZIndex,
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
      zIndex,
    } = this.props;

    // Check that source has changed
    const prevSourceParsed = prevSource?.parse === false
      ? prevSource
      : JSON.parse(replace(JSON.stringify(prevSource), prevParams, prevSqlParams));

    const sourceParsed = source.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

    // Check that render has changed
    const prevRenderParsed = prevRender?.parse === false
      ? prevRender
      : JSON.parse(replace(JSON.stringify(prevRender), prevParams, prevSqlParams));

    const renderParsed = render?.parse === false
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

        // Prevent updating layer
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
      this.update(changedProps);
    }
  }

  componentWillUnmount() {
    this.remove();
  }

  add = () => {
    const { layerManager, onAfterAdd, ...props } = this.props;
    const {
      source, render, params, sqlParams,
    } = props;

    const sourceParsed = source.parse === false
      ? source
      : JSON.parse(replace(JSON.stringify(source), params, sqlParams));

    const renderParsed = render?.parse === false
      ? render
      : JSON.parse(replace(JSON.stringify(render), params, sqlParams));

    layerManager.add(
      {
        ...props,
        source: sourceParsed,
        render: renderParsed,
      },
      {},
      onAfterAdd || Layer.defaultProps.onAfterAdd,
    );
  };

  update = (changedProps: Partial<LayerProps>): void => {
    const { layerManager, id } = this.props;

    layerManager.update(id, changedProps);
  };

  remove = (): void => {
    const { layerManager, id, onAfterRemove } = this.props;
    layerManager.remove(id, (layerModel) => {
      if (onAfterRemove) onAfterRemove(layerModel);
    });
  };

  render() {
    return null;
  }
}

export default Layer;
