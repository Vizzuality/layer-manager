import nodeResolvePlugin from 'rollup-plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';

export default [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named'
  },
  external: id => /(babel-runtime|lodash|bluebird)/.test(id),
  plugins: [
    babelPlugin({
      exclude: 'node_modules/**',
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
    format: 'cjs',
    exports: 'named'
  },
  external: id => id === 'react' || /(babel-runtime|bluebird|prop-types|lodash)/.test(id),
  plugins: [
    babelPlugin({
      exclude: 'node_modules/**',
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
