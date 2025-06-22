import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { useEffect } from "react";
import { Mesh } from "three";
import { WebGLDeferredRenderer } from "./WebGLDeferredRenderer";

function Thing() {
  const gl = useThree((state) => state.gl as WebGLDeferredRenderer);
  const size = useThree((state) => state.size);
  const dpr = useThree((state) => state.viewport.dpr);

  useEffect(() => {
    gl.resize(size.width * dpr, size.height * dpr);
  }, [gl, size, dpr]);

  useControls({
    pass: {
      options: gl.passes,
      value: gl.passes[0],
      onChange: (value: string) => {
        gl.outputPass = value;
      },
    },
  });

  const { scene } = useGLTF("/demo-2024-deferred-rendering/sponza.glb");

  useEffect(
    () => () => {
      // Recursively dispose
      scene.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((material) => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    },
    [scene]
  );

  return (
    <>
      <primitive object={scene} />
      <directionalLight />
    </>
  );
}

export default function App() {
  return (
    <>
      <Canvas
        key={WebGLDeferredRenderer.uuid} // force re-creation of the renderer
        gl={(props) => {
          return new WebGLDeferredRenderer(props);
        }}
      >
        <OrbitControls makeDefault target={[0, 2, 0]} />
        <PerspectiveCamera position={[8, 2, 2]} makeDefault />

        <Thing />
      </Canvas>
    </>
  );
}
