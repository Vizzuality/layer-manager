import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';
import pkg from './package.json';

const name = 'LayerManager';
const path = 'dist/layer-manager';
const globals = {
  axios: 'axios',
  leaflet: 'L',
  'lodash/compact': 'compact',
  'lodash/debounce': 'debounce',
  'lodash/isEmpty': 'isEmpty',
  'lodash/isEqual': 'isEqual',
  'lodash/sortBy': 'sortBy',
  'prop-types': 'PropTypes',
  'react-dom': 'ReactDOM',
  react: 'React',
  '@luma.gl/constants': '@luma.gl/constants',
  '@deck.gl/core': '@deck.gl/core',
  'luma.gl': 'luma.gl',
  '@loaders.gl/core': '@loaders.gl/core',
  'viewport-mercator-project': 'viewport-mercator-project',
  'deck.gl': 'deck.gl',
  '@deck.gl/mapbox': '@deck.gl/mapbox'
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
        'root': [
          './src/**'
        ],
        'extensions': ['.js', '.jsx']
      }
    ]
  ],
});

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'es',
    },
    external,
    plugins: [babel(babelOptions()), resolve()]
  },
  {
    input: 'src/index.umd.js',
    output: {
      name,
      file: `${path}.js`,
      format: 'umd',
      globals,
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs()]
  },
  {
    input: 'src/index.umd.js',
    output: {
      name,
      file: `${path}.min.js`,
      format: 'umd',
      globals,
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs(), uglify({}, minify)]
  },
  // Components
  {
    input: 'src/components/index.js',
    output: {
      file: 'dist/components/index.esm.js',
      format: 'esm',
    },
    external,
    plugins: [babel(babelOptions()), resolve()]
  },
  {
    input: 'src/components/index.umd.js',
    output: {
      name,
      file: 'dist/components/index.js',
      format: 'umd',
      globals,
    },
    external,
    plugins: [babel(babelOptions()), resolve(), commonjs()]
  }
];
