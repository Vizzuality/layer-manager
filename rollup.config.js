import nodeResolvePlugin from 'rollup-plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';

export default [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm',
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
    })
  ]
}, {
  input: 'src/react/index.js',
  output: {
    file: 'dist/react/index.js',
    format: 'esm'
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
    })
  ]
}];
