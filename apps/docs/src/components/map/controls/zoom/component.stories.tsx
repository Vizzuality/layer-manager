import { Story } from '@storybook/react/types-6-0';

import ZoomControl from './component';
import { ZoomControlProps } from './types';

const StoryZoomControl = {
  title: 'Components/Map/Controls/Zoom',
  component: ZoomControl,
};

export default StoryZoomControl;

const Template: Story<ZoomControlProps> = (args) => <ZoomControl {...args} />;

export const Default = Template.bind({});
Default.args = {
  className: '',
};
