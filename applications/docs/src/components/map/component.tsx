import { useEffect, useState, useRef, useCallback, FC } from 'react';

import ReactMapGL, { ViewState, ViewStateChangeEvent, useMap } from 'react-map-gl';

import cx from 'classnames';

import isEmpty from 'lodash/isEmpty';

import { useDebouncedCallback } from 'use-debounce';

// * If you plan to use Mapbox (and not a fork):
// * 1) remove maplibre-gl,
// * 2) install Mapbox v1/v2 (v2 requires token)
// * 3) if you installed v2: provide the token to the map through the `mapboxAccessToken` property
// * 4) remove `mapLib` property

import { DEFAULT_VIEW_STATE } from './constants';
import type { CustomMapProps } from './types';

export const CustomMap: FC<CustomMapProps> = ({
  // * if no id is passed, react-map-gl will store the map reference in a 'default' key:
  // * https://github.com/visgl/react-map-gl/blob/ecb27c8d02db7dd09d8104e8c2011bda6aed4b6f/src/components/use-map.tsx#L18
  id = 'default',
  children,
  className,
  viewState = {},
  initialViewState,
  bounds,
  onMapReady,
  onMapLoad,
  onViewStateChange,
  dragPan,
  dragRotate,
  scrollZoom,
  doubleClickZoom,
  ...mapboxProps
}: CustomMapProps) => {
  /**
   * REFS
   */
  const { [id]: mapRef } = useMap();
  const mapContainerRef = useRef(null);

  /**
   * STATE
   */
  const [localViewState, setLocalViewState] = useState<Partial<ViewState>>(!initialViewState && {
    ...DEFAULT_VIEW_STATE,
    ...viewState,
  });
  const [isFlying, setFlying] = useState(false);
  const [ready, setReady] = useState(false);
  const [loaded, setLoaded] = useState(false);

  /**
   * CALLBACKS
   */
  const debouncedViewStateChange = useDebouncedCallback((_viewState: ViewState) => {
    onViewStateChange(_viewState);
  }, 250);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    if (onMapLoad) onMapLoad({ map: mapRef, mapContainer: mapContainerRef.current });
  }, [onMapLoad, mapRef]);

  const handleFitBounds = useCallback(() => {
    if (!bounds) return null;
    const { bbox, options } = bounds;

    // enabling fly mode avoids the map to be interrupted during the bounds transition
    setFlying(true);

    mapRef.fitBounds(
      [
        [bbox[0], bbox[1]],
        [bbox[2], bbox[3]],
      ],
      options
    );
  }, [bounds, mapRef]);

  const handleMapMove = useCallback(
    ({ viewState: _viewState }: ViewStateChangeEvent) => {
      setLocalViewState(_viewState);
      debouncedViewStateChange(_viewState);
    },
    [debouncedViewStateChange]
  );

  /**
   * EFFECTS
   */
  useEffect(() => {
    setReady(true);
    // ? returning the map reference now is less useful as the reference is now accessible everywhere via useMap hook
    if (onMapReady) onMapReady({ map: mapRef, mapContainer: mapContainerRef.current });
  }, [onMapReady, mapRef]);

  useEffect(() => {
    if (loaded && !isEmpty(bounds) && !!bounds.bbox && bounds.bbox.every((b) => !!b)) {
      handleFitBounds();
    }
  }, [loaded, bounds, handleFitBounds]);

  useEffect(() => {
    setLocalViewState((prevViewState) => ({
      ...prevViewState,
      ...viewState,
    }));
  }, [viewState]);

  useEffect(() => {
    if (!bounds) return null;

    const { options } = bounds;
    const animationDuration = (options?.duration as number) || 0;
    let timeoutId: number = null;

    if (isFlying) {
      timeoutId = window.setTimeout(() => {
        setFlying(false);
      }, animationDuration);
    }

    return () => {
      if (timeoutId) {
        window.clearInterval(timeoutId);
      }
    };
  }, [bounds, isFlying]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
      className={cx({
        'relative w-full h-full z-0': true,
        [className]: !!className,
      })}
    >
      <ReactMapGL
        id={id}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        onLoad={handleLoad}
        dragPan={!isFlying && dragPan}
        dragRotate={!isFlying && dragRotate}
        scrollZoom={!isFlying && scrollZoom}
        doubleClickZoom={!isFlying && doubleClickZoom}
        {...(process.env.NODE_ENV === 'test' && { testMode: true })}
        initialViewState={initialViewState || localViewState}
        {...localViewState}
        {...mapboxProps}
        onMove={handleMapMove}
      >
        {ready &&
          loaded &&
          !!mapRef &&
          typeof children === 'function' &&
          children(mapRef?.getMap())}
      </ReactMapGL>
    </div>
  );
};

export default CustomMap;
