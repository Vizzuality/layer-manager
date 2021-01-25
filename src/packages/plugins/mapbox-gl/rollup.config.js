import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const globals = {
  axios: 'axios',
  'lodash/sortBy': 'sortBy',
  '@deck.gl/core': '@deck.gl/core',
  'deck.gl': 'deck.gl',
  '@luma.gl/core': '@luma.gl/core',
  '@luma.gl/constants': '@luma.gl/constants',
  'luma.gl': 'luma.gl',
  '@loaders.gl/images': '@loaders.gl/images'
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
      format: 'es'
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs()]
  }
];
