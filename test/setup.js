import jsdom from 'jsdom';

const { JSDOM } = jsdom;
const { window } = new JSDOM(`<html>
  <head>
    <meta charset="utf-8">
    <title>Testing Layer Manager</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.3.1/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.3.1/dist/leaflet.js"></script>
  </head>
  <body>
    <div id="map_canvas" style="width: 1024px; height: 768px"></div>
  </body>
</html>`, {
  resources: 'usable',
  runScripts: 'dangerously'
});

global.window = window;
global.document = window.document;
global.XMLHttpRequest = window.XMLHttpRequest;
