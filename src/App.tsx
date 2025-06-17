import { OrbitControls, PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { WebGLDeferredRenderer } from "./WebGLDeferredRenderer";

function Thing() {
  const gl = useThree((state) => state.gl as WebGLDeferredRenderer);

  useControls({
    pass: {
      options: gl.passes,
      value: gl.passes[0],
      onChange: (value: string) => {
        gl.outputPass = value;
      },
    },
  });

  const { scene } = useGLTF("/sponza.glb");

  const n = 10;
  const spacing = 2.2;

  return (
    <>
      <primitive object={scene} />
      {/* 
      {Array.from({ length: n }).map((_, i) => {
        let x = i * spacing;
        x -= (n - 1) * spacing * 0.5;

        const roughness = i / n;

        return (
          <Sphere position={[x, 2, 0]} key={i}>
            <meshStandardMaterial color="gray" roughness={roughness} />
          </Sphere>
        );
      })} */}

      <directionalLight />
    </>
  );
}

export default function App() {
  return (
    <Canvas
      key={WebGLDeferredRenderer.uuid} // force re-creation of the renderer
      shadows
      gl={(canvas) => {
        return new WebGLDeferredRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
      }}
    >
      <fog attach="fog" args={[0xffffff, 10, 90]} />

      {/* <OrbitControls makeDefault target={[0, 2, 0]} />
      <PerspectiveCamera position={[0, 2, 20]} makeDefault /> */}
      <OrbitControls makeDefault target={[0, 2, 0]} />
      <PerspectiveCamera position={[8, 2, 2]} makeDefault />

      <Thing />
    </Canvas>
  );
}
