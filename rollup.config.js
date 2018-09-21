import nodeResolvePlugin from 'rollup-plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';
import commonjsPlugin from 'rollup-plugin-commonjs';
import { uglify  } from 'rollup-plugin-uglify';

const globals = {
  'react-dom': 'ReactDOM',
  react: 'React',
  bluebird: 'Promise'
};

const external = Object.keys(globals);

const babelOptions = {
  exclude: 'node_modules/**',
  runtimeHelpers: true
};

const nodeResolveOptions = {
  module: true,
  jsnext: true,
  main: true
};

// const commonjsOptions = {
// };

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'lib/index.js',
      format: 'es',
      globals
    },
    external: [...external],
    plugins: [
      nodeResolvePlugin(nodeResolveOptions),
      babelPlugin(babelOptions),
      commonjsPlugin()
    ]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'umd',
      name: 'LayerManager',
      exports: 'named',
      globals
    },
    external: [...external],
    plugins: [
      nodeResolvePlugin(nodeResolveOptions),
      babelPlugin(babelOptions),
      commonjsPlugin(),
      uglify()
    ]
  },

  // React components
  {
    input: 'src/react/index.js',
    output: {
      file: 'lib/react/index.js',
      format: 'es',
      globals
    },
    external: [...external],
    plugins: [
      nodeResolvePlugin(nodeResolveOptions),
      babelPlugin(babelOptions),
      commonjsPlugin()
    ]
  }
];
