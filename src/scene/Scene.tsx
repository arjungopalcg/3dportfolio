import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { World } from "./World";
import { PostFX } from "./PostFX";
import { useKeyboard } from "../hooks/useKeyboard";
import { useLookControls } from "../hooks/useLookControls";
import { useStore } from "../store/useStore";

export function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const quality = useStore((s) => s.settings.quality);

  useKeyboard();
  useLookControls(containerRef);

  return (
    <div ref={containerRef} className="scene-container" role="application" aria-label="3D portfolio world">
      <Canvas
        shadows={quality === "high"}
        dpr={[1, quality === "high" ? 2 : 1.25]}
        camera={{ fov: 52, near: 0.1, far: 200, position: [0, 3.6, 15] }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#cfe0d3"]} />
        <World />
        {quality === "high" && <PostFX />}
      </Canvas>
    </div>
  );
}
