import * as THREE from "three";
import LightingFs from "../shaders/Lighting/Lighting.fs";
import LightingVs from "../shaders/Lighting/Lighting.vs";

export class LightingMaterial extends THREE.ShaderMaterial {
  declare uniforms: {
    uResolution: { value: THREE.Vector2 };

    uCameraNearFar: { value: THREE.Vector2 };
    uCameraProjectionInverse: { value: THREE.Matrix4 };
    uCameraMatrixWorld: { value: THREE.Matrix4 };

    tDepth: { value: THREE.Texture | null };
    tDiffuse: { value: THREE.Texture | null };
    tNormal: { value: THREE.Texture | null };
    tAoRoughMetal: { value: THREE.Texture | null };
    tPosition: { value: THREE.Texture | null };

    // Lights
    uPointLights: {
      value: {
        position: THREE.Vector3;
        color: THREE.Color;
      }[];
    };
  };

  constructor(gBufferPassCount: number) {
    super({
      uniforms: {
        uCameraNearFar: { value: new THREE.Vector2() },
        uResolution: { value: new THREE.Vector2() },

        tDepth: { value: null },
        tDiffuse: { value: null },
        tNormal: { value: null },
        tAoRoughMetal: { value: null },
        tPosition: { value: null },

        uCameraProjectionInverse: { value: new THREE.Matrix4() },
        uCameraMatrixWorld: { value: new THREE.Matrix4() },

        // Lights
        uPointLights: {
          value: Array.from({ length: 10 }, () => ({
            position: new THREE.Vector3(
              THREE.MathUtils.randFloatSpread(10),
              THREE.MathUtils.randFloat(0, 2),
              THREE.MathUtils.randFloatSpread(10)
            ),
            color: new THREE.Color()
              .setHSL(Math.random(), 1, 0.5)
              .multiplyScalar(5),
          })),
        },
      },
      vertexShader: LightingVs,
      fragmentShader: LightingFs,
      defines: {
        OUTPUT_PASS_COUNT: gBufferPassCount,
        OUTPUT_PASS_INDEX: 0,

        POINT_LIGHT_COUNT: 10,
      },
    });
  }

  set outputPass(value: number) {
    // this.uniforms.uOutputPassIndex.value = value;
    this.defines["OUTPUT_PASS_INDEX"] = value;
    this.needsUpdate = true;
  }

  update() {
    const time = performance.now() * 0.001;
    this.uniforms.uPointLights.value.forEach((light, i) => {
      // Move in random circles
      light.position.x = Math.cos(time + i) * 5;
      light.position.z = Math.sin(time + i) * 5;
    });
  }
}
