import { Children, FC, PropsWithChildren } from 'react';

import cn from 'lib/classnames';

import type { ControlsProps } from './types';

type ControlsPropsWithChildren = PropsWithChildren<ControlsProps>;

export const Controls: FC<ControlsPropsWithChildren> = ({
  className = 'absolute bottom-10 left-2',
  children,
}: ControlsPropsWithChildren) => (
  <div
    className={cn({
      'flex flex-col space-y-2': true,
      [className]: !!className,
    })}
  >
    {Children.map(children, (child) => child)}
  </div>
);

export default Controls;
