import { addons } from '@storybook/addons';
import { themes } from '@storybook/theming';

addons.setConfig({
  isFullscreen: false,
  showNav: true,
  showPanel: true,
  panelPosition: 'right',
  enableShortcuts: false,
  isToolshown: true,
  theme: themes.dark,
  selectedPanel: undefined,
  initialActive: 'sidebar',
  sidebar: {
    showRoots: true,
    collapsedRoots: ['other'],
  },
  toolbar: {
    title: { hidden: false, },
    zoom: { hidden: true, },
    eject: { hidden: true, },
    copy: { hidden: true, },
    fullscreen: { hidden: true, },
  },
});
