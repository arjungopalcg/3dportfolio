import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store/useStore";

interface BirdPath {
  cx: number;
  cz: number;
  radius: number;
  y: number;
  speed: number;
  phase: number;
}

export function Birds({ count }: { count: number }) {
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const refs = useRef<(THREE.Group | null)[]>([]);
  const wingRefs = useRef<(THREE.Mesh | null)[]>([]);

  const paths = useMemo<BirdPath[]>(() => {
    const rng = mulberry32(55);
    return new Array(count).fill(0).map(() => ({
      cx: (rng() - 0.5) * 50,
      cz: (rng() - 0.5) * 50,
      radius: 6 + rng() * 8,
      y: 8 + rng() * 6,
      speed: 0.12 + rng() * 0.08,
      phase: rng() * Math.PI * 2,
    }));
  }, [count]);

  useFrame((state) => {
    const t = reducedMotion ? 0 : state.clock.elapsedTime;
    paths.forEach((p, i) => {
      const group = refs.current[i];
      if (!group) return;
      const angle = t * p.speed + p.phase;
      const x = p.cx + Math.cos(angle) * p.radius;
      const z = p.cz + Math.sin(angle) * p.radius;
      const y = p.y + Math.sin(t * 0.4 + p.phase) * 0.6;
      group.position.set(x, y, z);
      group.rotation.y = -angle + Math.PI / 2;

      const wing = wingRefs.current[i];
      if (wing) {
        wing.rotation.z = reducedMotion ? 0.3 : Math.sin(t * 9 + p.phase) * 0.6;
      }
    });
  });

  return (
    <group>
      {paths.map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <mesh>
            <coneGeometry args={[0.06, 0.28, 5]} />
            <meshBasicMaterial color="#3a2f28" />
          </mesh>
          <mesh
            ref={(el) => {
              wingRefs.current[i] = el;
            }}
            position={[0, 0, 0]}
            rotation={[0, 0, 0.3]}
          >
            <planeGeometry args={[0.5, 0.08]} />
            <meshBasicMaterial color="#3a2f28" side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
