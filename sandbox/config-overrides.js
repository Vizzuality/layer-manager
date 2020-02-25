module.exports = function override(config, env) {
  console.log(config);
  config.resolve = {
    ...config.resolve,
    alias: {
      ...config.resolve.alias,
      'mapbox-gl': 'vizzuality-mapbox-gl'
    }
  };
  //do stuff with the webpack config...
  return config;
};
