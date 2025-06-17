export default /* glsl */ `
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}

float getDepth(vec2 screenPosition, sampler2D depthTexture) {
  return texture2D( depthTexture, screenPosition ).x;
}

float getViewZ(vec2 cameraNearFar, float depth) {
  return perspectiveDepthToViewZ(depth, cameraNearFar.x, cameraNearFar.y);
}

vec3 getWorldPosition(
  float depth,
  vec2 uv, 
  mat4 cameraMatrixWorldInverse,
  mat4 cameraProjectionInverse
) {
  vec4 ndc = vec4(
    (uv.x - 0.5) * 2.0,
    (uv.y - 0.5) * 2.0,
    (depth - 0.5) * 2.0,
    1.0
  );
  
  vec4 clip = cameraProjectionInverse * ndc;
  vec4 view = cameraMatrixWorldInverse * (clip / clip.w);
  return view.xyz;
}
`;
