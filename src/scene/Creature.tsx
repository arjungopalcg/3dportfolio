import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store/useStore";
import { ToonMesh } from "./Toon";

/** A small original forest critter (not based on any existing character) that peeks out from a bush. */
export function Creature({ position }: { position: [number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const seed = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (reducedMotion) {
      groupRef.current.position.y = 0.1;
      return;
    }
    const t = state.clock.elapsedTime + seed;
    const bob = Math.sin(t * 0.8) * 0.08;
    const cyclePos = ((t + 3) % 9) / 9;
    const duck = cyclePos < 0.14 ? Math.sin((cyclePos / 0.14) * Math.PI) * 0.32 : 0;
    groupRef.current.position.y = 0.1 + bob - duck;
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.3;
  });

  const [x, z] = position;

  return (
    <group position={[x, 0, z]}>
      {/* bush */}
      {[
        [0, 0, 0, 0.55],
        [0.35, -0.02, 0.15, 0.4],
        [-0.32, -0.02, 0.18, 0.38],
      ].map(([bx, by, bz, r], i) => (
        <ToonMesh key={i} castShadow position={[bx, 0.35 + by, bz]} color="#4f8a52">
          <sphereGeometry args={[r, 8, 7]} />
        </ToonMesh>
      ))}
      {/* creature, peeking from behind/above the bush */}
      <group ref={groupRef} position={[0, 0.1, 0.05]}>
        <ToonMesh castShadow scale={[1, 0.85, 0.9]} color="#cde3b0">
          <sphereGeometry args={[0.26, 12, 10]} />
        </ToonMesh>
        {/* ears */}
        <ToonMesh position={[-0.14, 0.24, 0]} rotation={[0, 0, 0.3]} color="#a9c98a">
          <coneGeometry args={[0.06, 0.16, 6]} />
        </ToonMesh>
        <ToonMesh position={[0.14, 0.24, 0]} rotation={[0, 0, -0.3]} color="#a9c98a">
          <coneGeometry args={[0.06, 0.16, 6]} />
        </ToonMesh>
        {/* eyes */}
        <mesh position={[-0.1, 0.05, 0.22]}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#fffaf0" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.22]}>
          <sphereGeometry args={[0.075, 8, 8]} />
          <meshStandardMaterial color="#fffaf0" />
        </mesh>
        <mesh position={[-0.1, 0.05, 0.28]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#3a2f22" />
        </mesh>
        <mesh position={[0.1, 0.05, 0.28]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color="#3a2f22" />
        </mesh>
        {/* nose */}
        <mesh position={[0, -0.05, 0.27]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#b5533f" />
        </mesh>
      </group>
    </group>
  );
}
