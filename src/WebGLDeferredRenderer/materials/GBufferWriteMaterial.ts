import * as THREE from "three";
import GBufferFs from "../shaders/GBuffer/GBuffer.fs";
import GBufferVs from "../shaders/GBuffer/GBuffer.vs";

export class GBufferWriteMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      vertexShader: GBufferVs,
      fragmentShader: GBufferFs,
      uniforms: {
        tDiffuse: { value: null },
        tNormal: { value: null },
        tRoughness: { value: null },

        diffuse: { value: new THREE.Color(0xffffff) },
        roughness: { value: 0.5 },
      },
      glslVersion: THREE.GLSL3,
    });
  }

  set tDiffuse(value: THREE.Texture | null) {
    this.uniforms.tDiffuse.value = value;
  }

  set tNormal(value: THREE.Texture | null) {
    this.uniforms.tNormal.value = value;
  }

  set tRoughness(value: THREE.Texture | null) {
    this.uniforms.tRoughness.value = value;
  }

  set diffuse(value: THREE.Color) {
    this.uniforms.diffuse.value = value;
  }

  set roughness(value: number) {
    this.uniforms.roughness.value = value;
  }
}
