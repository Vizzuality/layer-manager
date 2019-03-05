export default `
#define SHADER_NAME bitmap-layer-fragment-shader

#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D bitmapTexture;

varying vec2 vTexCoord;

{decodeParams}

uniform float opacity;
uniform float zoom;


vec4 decodeFunction(vec3 color, float alpha) {
  {decodeFunction}
  return vec4(color, alpha * opacity);
}

void main(void) {
  vec4 bitmapColor = texture2D(bitmapTexture, vTexCoord);

  // clear mask
  if (bitmapColor == vec4(0., 0., 0., 1.)) {
    discard;
  }

  // custom decode
  gl_FragColor = decodeFunction(bitmapColor.rgb, bitmapColor.a);

  // use highlight color if this fragment belongs to the selected object.
  gl_FragColor = picking_filterHighlightColor(gl_FragColor);

  // use picking color if rendering to picking FBO.
  gl_FragColor = picking_filterPickingColor(gl_FragColor);
}
`;
