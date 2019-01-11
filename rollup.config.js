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
  axios: 'axios'
};
const external = Object.keys(globals);

export default [
  {
    input: 'src/index.js',
    output: {
      file: pkg.module,
      format: 'esm',
    },
    external,
    plugins: [babel(), resolve()]
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
    plugins: [babel(), resolve(), commonjs()]
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
    plugins: [babel(), resolve(), commonjs(), uglify({}, minify)]
  }
];
