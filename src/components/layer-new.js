import { PureComponent } from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual'; // We can use another library


class Layer extends PureComponent {
  static propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,

    layerConfig: PropTypes.shape({}).isRequired,
    params: PropTypes.shape({}),
    sqlParams: PropTypes.shape({}),
    decodeParams: PropTypes.shape({}),

    opacity: PropTypes.number,
    visibility: PropTypes.bool,
    zIndex: PropTypes.number,

    layerManager: PropTypes.shape({}).isRequired
  };

  static defaultProps = {
    params: undefined,
    sqlParams: undefined,
    decodeParams: undefined,
    opacity: 1,
    visibility: true,
    zIndex: 1000
  };

  componentDidMount() {
    this.add();
  }

  componentDidUpdate(prevProps) {
    const {
      layerConfig: prevLayerConfig,
      params: prevParams,
      sqlParams: prevSqlParams,
      decodeParams: prevDecodeParams,
      opacity: prevOpacity,
      visibility: prevVisibility,
      zIndex: prevZIndex
    } = prevProps;

    const {
      layerConfig,
      params,
      sqlParams,
      decodeParams,
      opacity,
      visibility,
      zIndex
    } = this.props;

    if (
      !isEqual(layerConfig, prevLayerConfig) ||
      !isEqual(params, prevParams) ||
      !isEqual(sqlParams, prevSqlParams)
    ) {
      this.remove();
      this.add();
    }

    if (
      opacity !== prevOpacity ||
      visibility !== prevVisibility ||
      zIndex !== prevZIndex ||
      !isEqual(decodeParams, prevDecodeParams)
    ) {
      this.update();
    }
  }

  componentWillUnmount() {
    this.remove();
  }

  add = debounce(() => {
    const { layerManager, ...props } = this.props;
    layerManager.add(props, {});
  }, 50)

  update() {
    const { layerManager, ...props } = this.props;
    layerManager.update(props.id, props);
  }

  remove() {
    const { layerManager, id } = this.props;
    layerManager.remove(id);
  }

  render() {
    return null;
  }
}

export default Layer;
