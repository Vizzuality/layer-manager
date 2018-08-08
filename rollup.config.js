import nodeResolvePlugin from 'rollup-plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';
import commonjsPlugin from 'rollup-plugin-babel';

export default [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named',
  },
  external: id => id === 'bluebird' || /lodash/.test(id),
  plugins: [
    babelPlugin({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
      runtimeHelpers: true
    }),
    nodeResolvePlugin({
      modulesOnly: true,
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjsPlugin()
  ]
}, {
  input: 'src/react/index.js',
  output: {
    file: 'dist/react/index.js',
    format: 'cjs',
    exports: 'named'
  },
  external: id => id === 'bluebird' ||
    id === 'react' ||
    id === 'prop-types' ||
    /lodash/.test(id),
  plugins: [
    babelPlugin({
      exclude: 'node_modules/**',
      plugins: ['external-helpers'],
      runtimeHelpers: true
    }),
    nodeResolvePlugin({
      modulesOnly: true,
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjsPlugin()
  ]
}];
