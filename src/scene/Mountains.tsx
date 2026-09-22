import { useMemo } from "react";
import * as THREE from "three";

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RING_RADIUS = 130;
const PEAK_COUNT = 22;

/** A ring of jagged, flat-toned mountain silhouettes far in the distance — pure backdrop, no collision. */
export function Mountains() {
  const peaks = useMemo(() => {
    const rng = mulberry32(2024);
    return new Array(PEAK_COUNT).fill(0).map((_, i) => {
      const angle = (i / PEAK_COUNT) * Math.PI * 2 + rng() * 0.15;
      const radius = RING_RADIUS + rng() * 40;
      const height = 28 + rng() * 34;
      const width = 20 + rng() * 22;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height,
        width,
        rot: angle + Math.PI / 2,
        shade: 0.55 + rng() * 0.25,
      };
    });
  }, []);

  return (
    <group>
      {peaks.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, p.height / 2 - 4, p.z]}
          rotation={[0, p.rot, 0]}
        >
          <coneGeometry args={[p.width, p.height, 4]} />
          <meshBasicMaterial color={shadeColor(p.shade)} fog />
        </mesh>
      ))}
    </group>
  );
}

function shadeColor(t: number): THREE.Color {
  // cool blue-teal silhouette tones, darker = closer per the reference's layered mountains
  const c1 = new THREE.Color("#7fb3ad");
  const c2 = new THREE.Color("#a9d4cd");
  return c1.clone().lerp(c2, t);
}
