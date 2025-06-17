export default /* glsl */ `

struct PointLight {
  vec3 position;
  vec3 color;
};

uniform PointLight uPointLights[POINT_LIGHT_COUNT];

IncidentLight getPointLightInfo(
  PointLight pointLight, 
  vec3 worldPosition
) {
  IncidentLight light;
  vec3 direction = normalize(pointLight.position - worldPosition);

  float distance = length(pointLight.position - worldPosition);
  float attenuation = 1.0 / (distance * distance);
  vec3 radiance = pointLight.color * attenuation; 

  light.direction = direction;
  light.color = radiance;

  return light;
}

`;
