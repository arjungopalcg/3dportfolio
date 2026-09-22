import { useStore } from "../store/useStore";

export function Lighting() {
  const quality = useStore((s) => s.settings.quality);
  const shadows = quality === "high";

  return (
    <>
      <hemisphereLight args={["#fdf0d5", "#7a9b6e", 0.75]} />
      <directionalLight
        position={[22, 26, 12]}
        intensity={1.6}
        color="#ffdca8"
        castShadow={shadows}
        shadow-mapSize={[shadows ? 1024 : 256, shadows ? 1024 : 256]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={90}
        shadow-bias={-0.0015}
      />
      <ambientLight intensity={0.28} color="#e8d9c0" />
      <fogExp2 attach="fog" args={["#e9dcc4", 0.018]} />
    </>
  );
}
