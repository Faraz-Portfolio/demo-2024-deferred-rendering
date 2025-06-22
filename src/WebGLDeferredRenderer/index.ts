import * as THREE from "three";
import { FSQuad } from "./FSQuad";
import { GBuffer } from "./GBuffer";

interface WebGLDeferredRendererOptions extends THREE.WebGLRendererParameters {}

export class WebGLDeferredRenderer extends THREE.WebGLRenderer {
  static uuid = THREE.MathUtils.generateUUID();
  _superRender: THREE.WebGLRenderer["render"];

  _fsQuad: FSQuad;
  _fsQuadScene: THREE.Scene;

  _gBuffer: GBuffer;

  constructor(options?: WebGLDeferredRendererOptions) {
    super(options);

    this._gBuffer = new GBuffer(this);

    this._fsQuad = new FSQuad(5 + this._gBuffer.fbo.textures.length);
    this._fsQuadScene = new THREE.Scene();
    this._fsQuadScene.add(this._fsQuad);

    this._superRender = this.render;
    this.render = this.deferredRender.bind(this);

    this._fsQuad.tDepth = this._gBuffer.fbo.depthTexture;
    this._fsQuad.tDiffuse = this._gBuffer.fbo.textures[0];
    this._fsQuad.tNormal = this._gBuffer.fbo.textures[1];
    this._fsQuad.tAoRoughMetal = this._gBuffer.fbo.textures[2];
    this._fsQuad.tPosition = this._gBuffer.fbo.textures[3];

    const w = this.domElement.clientWidth * window.devicePixelRatio;
    const h = this.domElement.clientHeight * window.devicePixelRatio;
    this._fsQuad.uResolution.set(w, h);
  }

  resize(width: number, height: number): void {
    this._gBuffer.fbo.setSize(width, height);
    this._fsQuad.uResolution.set(width, height);
    this._fsQuad.update();
  }

  deferredRender(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this._fsQuad.uCameraNearFar.set(camera.near, camera.far);
    this._fsQuad.uCameraProjectionInverse.copy(camera.projectionMatrixInverse);
    this._fsQuad.uCameraMatrixWorld.copy(camera.matrixWorld);

    this._fsQuad.update();

    this._gBuffer.render(scene, camera);
    this._superRender(this._fsQuadScene, camera);
  }

  get passes() {
    return [
      "lighting",
      "depth",
      "roughness",
      "metalness",
      "ao",
      ...this._gBuffer.fbo.textures.map((t) => t.name),
    ];
  }

  set outputPass(pass: string) {
    const passIndex = this.passes.indexOf(pass);
    this._fsQuad.material.outputPass = passIndex;
  }

  dispose(): void {
    super.dispose();
    this._gBuffer.fbo.dispose();
  }
}
