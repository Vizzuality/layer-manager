import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const globals = {
  axios: 'axios',
  'lodash/omit': 'omit',
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
      file: 'dist/index.js',
      format: 'es',
      globals
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs()]
  },
  // build for external use
  {
    input: './index.js',
    output: {
      file: pkg.main,
      format: 'cjs'
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs(), terser()]
  }
];
