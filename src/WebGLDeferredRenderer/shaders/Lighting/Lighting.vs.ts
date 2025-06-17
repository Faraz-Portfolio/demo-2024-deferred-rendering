export default /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewVector;

  void main() {
    vUv = uv;

    vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vViewVector = worldPos - cameraPosition;

    gl_Position = vec4(position, 1.0);
  }
`;
