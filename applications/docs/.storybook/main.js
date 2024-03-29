const path = require("path");

module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: ['@storybook/addon-essentials'],
  typescript: {
    check: false,
    checkOptions: {},
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
  webpackFinal: async (config) => {
    // *************************
    // RESOLVE node_modules
    // If you want to add a directory to search in that takes precedence over node_modules/:
    // https://webpack.js.org/configuration/resolve/#resolvemodules
    config.resolve.modules = [path.resolve(__dirname, ".."), "node_modules"];
    config.resolve.alias = {
      '@deck.gl/core': path.join(path.resolve(__dirname, ".."), "node_modules/@deck.gl/core"),
      '@luma.gl/core': path.join(path.resolve(__dirname, ".."), "node_modules/@luma.gl/core"),
    }

    return config;
  },
}
