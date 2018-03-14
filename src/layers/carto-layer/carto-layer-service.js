import fetch from 'isomorphic-fetch';

const cartoService = layerSpec => {
  const { layerConfig, layerIndex, visibility, opacity } = layerSpec;

  // Transforming layerSpec
  const bodyStringified = JSON.stringify(layerConfig.body || {})
    .replace(/"cartocss-version":/g, '"cartocss_version":')
    .replace(/"geom-column"/g, '"geom_column"')
    .replace(/"geom-type"/g, '"geom_type"')
    .replace(/"raster-band"/g, '"raster_band"');
  const url = `https://${layerConfig.account}.carto.com/api/v1/map`;

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: bodyStringified
  })
    .then(response => {
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    });
};

export default cartoService;
