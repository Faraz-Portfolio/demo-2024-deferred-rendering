import BRDF_direct from "./utils/BRDF_direct";
import getWorldPosition from "./utils/getWorldPosition";
import lights from "./utils/lights";
import pointLights from "./utils/pointLights";

export default /* glsl */ `

#define PI 3.14159265359

uniform vec2 uResolution;
uniform vec2 uCameraNearFar;
uniform mat4 uCameraProjectionInverse;
uniform mat4 uCameraMatrixWorld;

uniform sampler2D tDepth;
uniform sampler2D tDiffuse;
uniform sampler2D tNormal;
uniform sampler2D tAoRoughMetal;
uniform sampler2D tPosition;

varying vec2 vUv;
varying vec3 vViewVector;

${getWorldPosition}
${lights}
${pointLights}

${BRDF_direct}

float mapLinear(float x, float a1, float a2, float b1, float b2) {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  // Properties
  vec3 diffuse = texture2D(tDiffuse, vUv).rgb;
  vec3 normal = texture2D(tNormal, vUv).xyz * 2.0 - 1.0;
  vec3 aoRoughMetal = texture2D(tAoRoughMetal, vUv).xyz;

  float ao = aoRoughMetal.r;
  float roughness = aoRoughMetal.g;
  float metallic = aoRoughMetal.b;

  float depth = getDepth(uv, tDepth);
  float viewZ = -getViewZ(uCameraNearFar, depth) * 0.05;
  vec3 worldPos = getWorldPosition(depth, uv, uCameraMatrixWorld, uCameraProjectionInverse);

  // Lighting
  vec3 N = normalize(normal); 
  vec3 V = normalize(cameraPosition - worldPos);

  // Lo = Outgoing Light
  vec3 Lo = vec3(0.0);

  // Point lights
  for(int i = 0; i < POINT_LIGHT_COUNT; i++) {
    PointLight pointLight = uPointLights[i];
    IncidentLight incidentLight = getPointLightInfo(pointLight, worldPos);
  
    // H = Halfway Vector between V and L 
    vec3 L = incidentLight.direction;
    vec3 H = normalize(V + L);

    // F0 = Surface Reflectance at Zero Incidence
    // Metaliic and non-metallic materials have different F0 values 
    vec3 F0 = vec3(0.04); 
    F0 = mix(F0, diffuse, metallic);
    
    // F = Fresnel factor
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

    // NDF = Normal Distribution Function
    // G = Geometry Function
    float NDF = DistributionGGX(N, H, roughness);       
    float G = GeometrySmith(N, V, L, roughness); 

    // Cook-Torrance BRDF
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0)  + 0.0001;
    vec3 specular = numerator / denominator; 

    // kS = Reflected light
    // kD = Refracted light
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    // Metals don't refract light      
    kD *= 1.0 - metallic;	 

    float NdotL = max(dot(N, L), 0.0);  
    vec3 radiance = incidentLight.color;      
    Lo += (kD * diffuse / PI + specular) * radiance * NdotL;
  }

  vec3 ambient = vec3(0.03) * diffuse * ao;
  vec3 color = ambient + Lo; 

  // Gamma correction
  color = color / (color + vec3(1.0));
  color = pow(color, vec3(1.0/2.2)); 

  // Output
  vec4[OUTPUT_PASS_COUNT] outputs = vec4[OUTPUT_PASS_COUNT](
    // Lighting
    vec4(color, 1.0),
    // Depth
    vec4(vec3(viewZ), 1.0),
    // Roughness
    vec4(vec3(roughness), 1.0),
    // Metallic
    vec4(vec3(metallic), 1.0),
    // AO
    vec4(vec3(ao), 1.0),
    // Diffuse
    vec4(diffuse, 1.0),
    // Normal
    vec4(normal, 1.0),
    // AO, Roughness, Metalness
    vec4(ao, roughness, metallic, 1.0)
  );
  
  gl_FragColor = outputs[OUTPUT_PASS_INDEX];
}
`;
