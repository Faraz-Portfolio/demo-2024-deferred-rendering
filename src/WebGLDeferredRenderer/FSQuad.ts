import * as THREE from "three";
import { LightingMaterial } from "./materials/LightingMaterial";

export class FSQuad extends THREE.Mesh<THREE.PlaneGeometry, LightingMaterial> {
  constructor(gBufferPassCount: number) {
    super(
      new THREE.PlaneGeometry(2, 2),
      new LightingMaterial(gBufferPassCount)
    );
  }

  update() {
    this.material.update();
  }

  get uCameraNearFar() {
    return this.material.uniforms.uCameraNearFar.value;
  }

  get uCameraProjectionInverse() {
    return this.material.uniforms.uCameraProjectionInverse.value;
  }

  get uCameraMatrixWorld() {
    return this.material.uniforms.uCameraMatrixWorld.value;
  }

  get uResolution() {
    return this.material.uniforms.uResolution.value;
  }

  set tDepth(value: THREE.Texture | null) {
    this.material.uniforms.tDepth.value = value;
  }

  set tDiffuse(value: THREE.Texture | null) {
    this.material.uniforms.tDiffuse.value = value;
  }

  set tNormal(value: THREE.Texture | null) {
    this.material.uniforms.tNormal.value = value;
  }

  set tAoRoughMetal(value: THREE.Texture | null) {
    this.material.uniforms.tAoRoughMetal.value = value;
  }

  set tPosition(value: THREE.Texture | null) {
    this.material.uniforms.tPosition.value = value;
  }
}
