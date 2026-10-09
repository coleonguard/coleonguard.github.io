export const VERTEX_SHADER = /* glsl */ `
  attribute float aAlpha;
  attribute float aSize;
  attribute float aAccent;
  uniform float uPixelRatio;
  uniform float uAccentMix;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    vAlpha = aAlpha;
    vAccent = aAccent * uAccentMix;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + vAccent * 0.35);
  }
`;

export const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uAccent;
  varying float vAlpha;
  varying float vAccent;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float disc = smoothstep(0.5, 0.0, d);
    vec3 color = mix(uColor, uAccent, vAccent);
    gl_FragColor = vec4(color, disc * vAlpha);
  }
`;
