import { FC, useCallback, MouseEvent } from 'react';

import { useMap } from 'react-map-gl';

import cx from 'classnames';

import { TooltipPortal } from '@radix-ui/react-tooltip';

import Icon from 'components/icon';
import { Tooltip, TooltipArrow, TooltipContent, TooltipTrigger } from 'components/ui/tooltip';

import ZOOM_IN_SVG from 'svgs/map/zoom-in.svg?sprite';
import ZOOM_OUT_SVG from 'svgs/map/zoom-out.svg?sprite';

import { CONTROL_BUTTON_STYLES } from '../constants';

import type { ZoomControlProps } from './types';

export const ZoomControl: FC<ZoomControlProps> = ({ className }: ZoomControlProps) => {
  const { default: mapRef } = useMap();
  const zoom = mapRef?.getZoom();
  const minZoom = mapRef?.getMinZoom();
  const maxZoom = mapRef?.getMaxZoom();

  const increaseZoom = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      mapRef.zoomIn();
    },
    [mapRef]
  );

  const decreaseZoom = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      mapRef.zoomOut();
    },
    [mapRef]
  );

  return (
    <div
      className={cx({
        'flex flex-col space-y-0.5': true,
        [className]: !!className,
      })}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cx({
              [CONTROL_BUTTON_STYLES.default]: true,
              [CONTROL_BUTTON_STYLES.hover]: zoom !== maxZoom,
              [CONTROL_BUTTON_STYLES.active]: zoom !== maxZoom,
              [CONTROL_BUTTON_STYLES.disabled]: zoom === maxZoom,
            })}
            aria-label="Zoom in"
            type="button"
            disabled={zoom === maxZoom}
            onClick={increaseZoom}
          >
            <Icon icon={ZOOM_IN_SVG} className="h-full w-full" />
          </button>
        </TooltipTrigger>

        <TooltipPortal>
          <TooltipContent
            side="left"
            align="center"
            className="rounded-none border-navy-500 bg-navy-500"
          >
            <div className="text-xxs text-white">Zoom in</div>

            <TooltipArrow className="fill-navy-500" width={10} height={5} />
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cx({
              [CONTROL_BUTTON_STYLES.default]: true,
              [CONTROL_BUTTON_STYLES.hover]: zoom !== minZoom,
              [CONTROL_BUTTON_STYLES.active]: zoom !== minZoom,
              [CONTROL_BUTTON_STYLES.disabled]: zoom === minZoom,
            })}
            aria-label="Zoom out"
            type="button"
            disabled={zoom === minZoom}
            onClick={decreaseZoom}
          >
            <Icon icon={ZOOM_OUT_SVG} className="h-full w-full" />
          </button>
        </TooltipTrigger>

        <TooltipPortal>
          <TooltipContent
            side="left"
            align="center"
            className="rounded-none border-navy-500 bg-navy-500"
          >
            <div className="text-xxs text-white">Zoom out</div>

            <TooltipArrow className="fill-navy-500" width={10} height={5} />
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </div>
  );
};

export default ZoomControl;
