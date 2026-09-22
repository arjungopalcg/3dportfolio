import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { District as DistrictData } from "../data/districts";
import { registerCollidable, unregisterCollidable } from "./collidables";
import { useStore } from "../store/useStore";

interface Props {
  district: DistrictData;
}

export function District({ district }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const nearby = useStore((s) => s.nearbyDistrict === district.id);

  useEffect(() => {
    const g = groupRef.current;
    if (g) registerCollidable(g);
    return () => {
      if (g) unregisterCollidable(g);
    };
  }, []);

  const [x, z] = district.position;

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* footprint disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[4.2, 24]} />
        <meshStandardMaterial color={district.accent} roughness={1} />
      </mesh>
      <Building district={district} />
      {/* interaction glow marker */}
      <mesh ref={glowRef} position={[0, 2.6, 2.6]}>
        <sphereGeometry args={[nearby ? 0.28 : 0.2, 12, 12]} />
        <meshStandardMaterial
          color={district.accent}
          emissive={district.accent}
          emissiveIntensity={nearby ? 2.2 : 1.1}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Building({ district }: Props) {
  const c = district.color;
  const a = district.accent;
  switch (district.shape) {
    case "tower":
      return (
        <group>
          <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
            <cylinderGeometry args={[1.5, 1.7, 3, 12]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
          <mesh castShadow position={[0, 3.6, 0]}>
            <cylinderGeometry args={[1.7, 1.7, 0.3, 12]} />
            <meshStandardMaterial color={a} flatShading />
          </mesh>
          <mesh castShadow position={[0, 4.6, 0]}>
            <coneGeometry args={[1.85, 1.8, 12]} />
            <meshStandardMaterial color="#7a3f3f" flatShading />
          </mesh>
        </group>
      );
    case "barn":
      return (
        <group>
          <mesh castShadow receiveShadow position={[0, 1.2, 0]}>
            <boxGeometry args={[3, 2.4, 2.6]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
          <mesh castShadow position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]}>
            <coneGeometry args={[2.35, 1.4, 4]} />
            <meshStandardMaterial color={a} flatShading />
          </mesh>
        </group>
      );
    case "warehouse":
      return (
        <group>
          <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
            <boxGeometry args={[3.6, 2.6, 3]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
          <mesh castShadow position={[0, 2.75, 0]}>
            <boxGeometry args={[3.8, 0.3, 3.2]} />
            <meshStandardMaterial color={a} flatShading />
          </mesh>
        </group>
      );
    case "hangar":
      return (
        <group>
          <mesh
            castShadow
            receiveShadow
            position={[0, 1.1, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[1.9, 1.9, 3.2, 16, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color={c} flatShading side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 1.1, -1.6]}>
            <planeGeometry args={[3.8, 2.2]} />
            <meshStandardMaterial color={a} flatShading />
          </mesh>
        </group>
      );
    case "ledger":
      return (
        <group>
          <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
            <boxGeometry args={[2.8, 2.8, 2.6]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
          <mesh castShadow position={[0, 2.9, 0]}>
            <boxGeometry args={[3.1, 0.25, 2.9]} />
            <meshStandardMaterial color={a} flatShading />
          </mesh>
          <mesh castShadow position={[0, 0.75, 1.35]}>
            <boxGeometry args={[0.9, 1.5, 0.1]} />
            <meshStandardMaterial color="#3f2f20" flatShading />
          </mesh>
        </group>
      );
    case "grove":
      return (
        <group>
          <mesh castShadow position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.35, 0.45, 3.2, 8]} />
            <meshStandardMaterial color="#8a6a45" flatShading />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              castShadow
              position={[0, 3.2 - i * 0.7, 0]}
              scale={[1 - i * 0.18, 0.9, 1 - i * 0.18]}
            >
              <sphereGeometry args={[1.4, 10, 8]} />
              <meshStandardMaterial color={i % 2 === 0 ? c : a} flatShading />
            </mesh>
          ))}
        </group>
      );
    case "garden":
      return (
        <group>
          {[
            [-1.3, 0],
            [1.3, 0],
            [0, -1.3],
            [0, 1.3],
          ].map(([px, pz], i) => (
            <group key={i} position={[px, 0, pz]}>
              <mesh castShadow position={[0, 0.9, 0]}>
                <cylinderGeometry args={[0.12, 0.14, 1.8, 8]} />
                <meshStandardMaterial color="#5a4a3a" flatShading />
              </mesh>
              <mesh castShadow position={[0, 1.9, 0]}>
                <sphereGeometry args={[0.32, 10, 8]} />
                <meshStandardMaterial
                  color={a}
                  emissive={a}
                  emissiveIntensity={0.6}
                  toneMapped={false}
                />
              </mesh>
            </group>
          ))}
          <mesh castShadow position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.6, 0.7, 0.8, 10]} />
            <meshStandardMaterial color={c} flatShading />
          </mesh>
        </group>
      );
    case "signpost":
      return (
        <group>
          <mesh castShadow position={[0, 1.6, 0]}>
            <cylinderGeometry args={[0.14, 0.18, 3.2, 8]} />
            <meshStandardMaterial color="#5a4a3a" flatShading />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh key={i} castShadow position={[0.6, 2.6 - i * 0.5, 0]}>
              <boxGeometry args={[1.3, 0.32, 0.06]} />
              <meshStandardMaterial color={i % 2 === 0 ? c : a} flatShading />
            </mesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}
