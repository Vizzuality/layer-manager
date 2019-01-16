import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import pkg from './package.json';

const name = 'LayerManager';
const path = 'dist/layer-manager';
const globals = {
  'react-dom': 'ReactDOM',
  react: 'React',
  leaflet: 'L',
  axios: 'axios',
  'prop-types': 'PropTypes'
};
const external = Object.keys(globals);
const babelOptionsFn = () => ({
  babelrc: false,
  presets: [['env', { modules: false }], 'react'],
  plugins: [
    'transform-class-properties',
    'transform-object-rest-spread',
    'external-helpers',
    [
      'module-resolver',
      {
        'root': [
          './src/**'
        ],
        'extensions': ['.js', '.jsx']
      }
    ]
  ],
});
const babelOptions = babelOptionsFn();

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'esm',
    },
    external,
    plugins: [babel(babelOptions), resolve()]
  },
  {
    input: 'src/index.umd.js',
    output: {
      name,
      file: `${path}.js`,
      format: 'umd',
      globals,
      exports: 'named'
    },
    external,
    plugins: [babel(babelOptions), resolve(), commonjs()]
  },
  {
    input: 'src/index.umd.js',
    output: {
      name,
      file: `${path}.min.js`,
      format: 'umd',
      globals,
      exports: 'named'
    },
    external,
    plugins: [babel(babelOptions), resolve(), commonjs(), uglify({}, minify)]
  },
  // Components
  {
    input: 'src/components/index.js',
    output: {
      file: 'dist/components/index.esm.js',
      format: 'esm',
    },
    external,
    plugins: [babel(babelOptions), resolve()]
  },
  {
    input: 'src/components/index.umd.js',
    output: {
      name,
      file: 'dist/components/index.js',
      format: 'umd',
      globals,
      exports: 'named'
    },
    external,
    plugins: [babel(babelOptions), resolve(), commonjs()]
  }
];
