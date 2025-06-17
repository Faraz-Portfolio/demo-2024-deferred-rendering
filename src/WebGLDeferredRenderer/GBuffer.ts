import * as THREE from "three";
import { WebGLDeferredRenderer } from ".";
import { GBufferWriteMaterial } from "./materials/GBufferWriteMaterial";

export class GBuffer {
  renderer: WebGLDeferredRenderer;
  fbo: THREE.WebGLRenderTarget;

  _forwardMaterial: GBufferWriteMaterial;
  _materialCache: {
    [key: string]: {
      originalMaterial: THREE.Material;
      gBufferMaterial: GBufferWriteMaterial;
    };
  } = {};

  constructor(renderer: WebGLDeferredRenderer) {
    this.renderer = renderer;

    const w = renderer.domElement.clientWidth * window.devicePixelRatio;
    const h = renderer.domElement.clientHeight * window.devicePixelRatio;

    const depthTexture = new THREE.DepthTexture(w, h);

    this.fbo = new THREE.WebGLRenderTarget(w, h, {
      count: 3,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      depthTexture: depthTexture,
      depthBuffer: true,
      stencilBuffer: false,
      generateMipmaps: false,
    });

    this.fbo.textures[0].name = "diffuse";
    this.fbo.textures[1].name = "normal";
    this.fbo.textures[2].name = "aoRoughMetal";

    this._forwardMaterial = new GBufferWriteMaterial();
    this._materialCache = {};
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.renderer.setRenderTarget(this.fbo);
    // scene.overrideMaterial = this._forwardMaterial;
    // this.renderer._superRender(scene, camera);
    // scene.overrideMaterial = null;

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        if (!this._materialCache[obj.uuid]) {
          this._materialCache[obj.uuid] = {
            originalMaterial: obj.material,
            gBufferMaterial: this._forwardMaterial.clone(),
          };

          this._materialCache[obj.uuid].gBufferMaterial.tDiffuse =
            obj.material.map;
          this._materialCache[obj.uuid].gBufferMaterial.tNormal =
            obj.material.normalMap;
          this._materialCache[obj.uuid].gBufferMaterial.tRoughness =
            obj.material.roughnessMap;

          this._materialCache[obj.uuid].gBufferMaterial.diffuse =
            obj.material.color;
          this._materialCache[obj.uuid].gBufferMaterial.roughness =
            obj.material.roughness;

          obj.material = this._materialCache[obj.uuid].gBufferMaterial;
        } else {
          obj.material = this._materialCache[obj.uuid].gBufferMaterial;
        }
      }
    });

    this.renderer._superRender(scene, camera);

    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.material = this._materialCache[obj.uuid].originalMaterial;
      }
    });

    this.renderer.setRenderTarget(null);
  }

  dispose() {
    for (const key in this._materialCache) {
      this._materialCache[key].gBufferMaterial.dispose();
    }
  }
}
