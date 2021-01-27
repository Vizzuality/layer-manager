import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const globals = {
  react: 'React',
  'prop-types': 'PropTypes',
  axios: 'axios',
  'lodash/isEmpty': 'isEmpty',
  'lodash/isEqual': 'isEqual',
  '@vizzuality/layer-manager': '@vizzuality/layer-manager',
  '@vizzuality/layer-manager-utils': '@vizzuality/layer-manager-utils'
};
const external = Object.keys(globals);
const babelOptions = () => ({
  babelrc: false,
  presets: [['env', { modules: false }], 'react'],
  plugins: [
    'transform-class-properties',
    'transform-object-rest-spread',
    'external-helpers',
    [
      'module-resolver',
      {
        root: ['./src/**'],
        extensions: ['.js', '.jsx']
      }
    ]
  ]
});

export default [
  {
    input: './index.js',
    output: {
      file: pkg.module,
      format: 'es',
      globals
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs()]
  }
];
