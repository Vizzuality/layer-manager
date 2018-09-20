import nodeResolvePlugin from 'rollup-plugin-node-resolve';
import babelPlugin from 'rollup-plugin-babel';
import commonjsPlugin from 'rollup-plugin-commonjs';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    external: id => /(lodash|bluebird)/.test(id),
    plugins: [
      babelPlugin({
        exclude: 'node_modules/**'
      }),
      nodeResolvePlugin({
        jsnext: true,
        main: true
      }),
      commonjsPlugin({
        include: 'node_modules/**'
      })
    ]
  },
  {
    input: 'src/react/index.js',
    output: {
      file: 'dist/react/index.js',
      format: 'cjs',
      exports: 'named'
    },
    external: id => id === 'react' || /(bluebird|prop-types|lodash)/.test(id),
    plugins: [
      babelPlugin({
        exclude: 'node_modules/**'
      }),
      nodeResolvePlugin({
        jsnext: true,
        main: true
      }),
      commonjsPlugin({
        include: 'node_modules/**'
      })
    ]
  }
];
