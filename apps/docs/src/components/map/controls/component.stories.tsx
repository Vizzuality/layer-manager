import { Story } from '@storybook/react/types-6-0';

import ZoomControl from 'components/map/controls/zoom';

import Controls from './component';
import { ControlsProps } from './types';

const StoryControls = {
  title: 'Components/Map/Controls',
  component: Controls,
};

export default StoryControls;

const Template: Story<ControlsProps> = (args) => {
  return (
    <div className="relative h-24">
      <Controls {...args}>
        <ZoomControl />
      </Controls>
    </div>
  );
};

export const Default = Template.bind({});
Default.args = {
  className: 'w-10 absolute bottom-0 left-0',
};
