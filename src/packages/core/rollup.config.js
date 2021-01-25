import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import pkg from './package.json';

const globals = {
  axios: 'axios',
  'lodash/isEmpty': 'isEmpty',
  'lodash/isEqual': 'isEqual'
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
      file: `./dist/${pkg.module}`,
      format: 'es'
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs()]
  }
];
