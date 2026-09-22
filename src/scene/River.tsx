import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildRibbonGeometry } from "../utils/ribbon";
import { useStore } from "../store/useStore";

const RIVER_WIDTH = 3;

const WAYPOINTS: [number, number][] = [
  [-14, 16],
  [10, 11],
  [30, 14],
  [48, 9],
  [66, 15],
  [86, 8],
];

export function River() {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);

  const geometry = useMemo(() => {
    const pts = WAYPOINTS.map(([x, z]) => new THREE.Vector3(x, -0.08, z));
    return buildRibbonGeometry(pts, RIVER_WIDTH, 120);
  }, []);

  useFrame((state) => {
    if (!materialRef.current || reducedMotion) return;
    materialRef.current.emissiveIntensity = 0.22 + Math.sin(state.clock.elapsedTime * 1.3) * 0.08;
  });

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        ref={materialRef}
        color="#4f8fa8"
        emissive="#bfe6ea"
        emissiveIntensity={0.22}
        transparent
        opacity={0.88}
        roughness={0.25}
      />
    </mesh>
  );
}

export function riverCrossingPoint(): [number, number] {
  return [48, 9];
}
