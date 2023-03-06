export { default } from './src/index';

interface Plugin {
  add: () => void
  remove: () => void
  setVisibility: () => void
  setOpacity: () => void
  setZIndex: () => void
  setSource: () => void
  setRender: () => void
  setParams: () => void
  setSQLParams: () => void
  getLayerByType: () => void
}
