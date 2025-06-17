export default /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tRoughness;

uniform vec3 diffuse;
uniform float roughness;

layout(location = 0) out vec4 gDiffuse;
layout(location = 1) out vec4 gNormal;
layout(location = 2) out vec4 gAoRoughMetal;
layout(location = 3) out vec4 gPosition;

void main() {
  gDiffuse = vec4(diffuse, 1.0) * texture(tDiffuse, vUv);
  gNormal = vec4(vNormal, 1.0);
  gAoRoughMetal = vec4(0.0, roughness, 0.0, 1.0) * texture(tRoughness, vUv);
}
`;
