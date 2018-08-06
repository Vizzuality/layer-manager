import nodeResolvePlugin from 'rollup-plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';

export default [{
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm'
  },
  plugins: [
    nodeResolvePlugin({
      modulesOnly: true
    }),
    babelPlugin({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    })
  ]
}, {
  input: 'src/react/index.js',
  output: {
    file: 'dist/react/index.js',
    format: 'esm'
  },
  plugins: [
    nodeResolvePlugin({
      modulesOnly: true
    }),
    babelPlugin({
      exclude: 'node_modules/**',
      plugins: ['external-helpers']
    })
  ]
}];
