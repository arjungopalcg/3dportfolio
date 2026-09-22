import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { District as DistrictData } from "../data/districts";
import { registerCollidable, unregisterCollidable } from "./collidables";
import { useStore } from "../store/useStore";
import { Toon, Glow, ToonMesh } from "./Toon";

interface Props {
  district: DistrictData;
}

export function District({ district }: Props) {
  const groupRef = useRef<THREE.Group>(null);
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
        <circleGeometry args={[district.plazaRadius ?? 4.2, 28]} />
        <Toon color={district.accent} />
      </mesh>
      <Building district={district} nearby={nearby} />
      {/* interaction glow marker (the hub's lantern serves this role itself) */}
      {district.shape !== "hub" && (
        <mesh position={[0, 2.6, 2.6]}>
          <sphereGeometry args={[nearby ? 0.28 : 0.2, 12, 12]} />
          <Glow color={district.accent} intensity={nearby ? 2.2 : 1.1} />
        </mesh>
      )}
    </group>
  );
}

function Building({ district, nearby }: Props & { nearby: boolean }) {
  const c = district.color;
  const a = district.accent;
  switch (district.shape) {
    case "hub":
      return (
        <group>
          <ToonMesh castShadow position={[0, 1.1, 0]} color="#8a6a45">
            <cylinderGeometry args={[0.18, 0.22, 2.2, 8]} />
          </ToonMesh>
          <mesh castShadow position={[0, 2.5, 0]}>
            <sphereGeometry args={[0.5, 14, 12]} />
            <Glow color="#f4b79f" intensity={nearby ? 1.6 : 0.9} />
          </mesh>
        </group>
      );
    case "tower":
      return (
        <group>
          <ToonMesh castShadow receiveShadow position={[0, 1.5, 0]} color={c}>
            <cylinderGeometry args={[1.5, 1.7, 3, 12]} />
          </ToonMesh>
          <ToonMesh castShadow position={[0, 3.6, 0]} color={a}>
            <cylinderGeometry args={[1.7, 1.7, 0.3, 12]} />
          </ToonMesh>
          <ToonMesh castShadow position={[0, 4.6, 0]} color="#7a3f3f">
            <coneGeometry args={[1.85, 1.8, 12]} />
          </ToonMesh>
        </group>
      );
    case "barn":
      return (
        <group>
          <ToonMesh castShadow receiveShadow position={[0, 1.2, 0]} color={c}>
            <boxGeometry args={[3, 2.4, 2.6]} />
          </ToonMesh>
          <ToonMesh castShadow position={[0, 2.8, 0]} rotation={[0, Math.PI / 4, 0]} color={a}>
            <coneGeometry args={[2.35, 1.4, 4]} />
          </ToonMesh>
        </group>
      );
    case "warehouse":
      return (
        <group>
          <ToonMesh castShadow receiveShadow position={[0, 1.3, 0]} color={c}>
            <boxGeometry args={[3.6, 2.6, 3]} />
          </ToonMesh>
          <ToonMesh castShadow position={[0, 2.75, 0]} color={a}>
            <boxGeometry args={[3.8, 0.3, 3.2]} />
          </ToonMesh>
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
            <Toon color={c} side={THREE.DoubleSide} />
          </mesh>
          <ToonMesh position={[0, 1.1, -1.6]} color={a}>
            <planeGeometry args={[3.8, 2.2]} />
          </ToonMesh>
        </group>
      );
    case "ledger":
      return (
        <group>
          <ToonMesh castShadow receiveShadow position={[0, 1.4, 0]} color={c}>
            <boxGeometry args={[2.8, 2.8, 2.6]} />
          </ToonMesh>
          <ToonMesh castShadow position={[0, 2.9, 0]} color={a}>
            <boxGeometry args={[3.1, 0.25, 2.9]} />
          </ToonMesh>
          <ToonMesh castShadow position={[0, 0.75, 1.35]} color="#3f2f20">
            <boxGeometry args={[0.9, 1.5, 0.1]} />
          </ToonMesh>
        </group>
      );
    case "grove":
      return (
        <group>
          <ToonMesh castShadow position={[0, 1.6, 0]} color="#8a6a45">
            <cylinderGeometry args={[0.35, 0.45, 3.2, 8]} />
          </ToonMesh>
          {[0, 1, 2].map((i) => (
            <ToonMesh
              key={i}
              castShadow
              position={[0, 3.2 - i * 0.7, 0]}
              scale={[1 - i * 0.18, 0.9, 1 - i * 0.18]}
              color={i % 2 === 0 ? c : a}
            >
              <sphereGeometry args={[1.4, 10, 8]} />
            </ToonMesh>
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
              <ToonMesh castShadow position={[0, 0.9, 0]} color="#5a4a3a">
                <cylinderGeometry args={[0.12, 0.14, 1.8, 8]} />
              </ToonMesh>
              <mesh castShadow position={[0, 1.9, 0]}>
                <sphereGeometry args={[0.32, 10, 8]} />
                <Glow color={a} intensity={0.6} />
              </mesh>
            </group>
          ))}
          <ToonMesh castShadow position={[0, 0.4, 0]} color={c}>
            <cylinderGeometry args={[0.6, 0.7, 0.8, 10]} />
          </ToonMesh>
        </group>
      );
    case "signpost":
      return (
        <group>
          <ToonMesh castShadow position={[0, 1.6, 0]} color="#5a4a3a">
            <cylinderGeometry args={[0.14, 0.18, 3.2, 8]} />
          </ToonMesh>
          {[0, 1, 2].map((i) => (
            <ToonMesh key={i} castShadow position={[0.6, 2.6 - i * 0.5, 0]} color={i % 2 === 0 ? c : a}>
              <boxGeometry args={[1.3, 0.32, 0.06]} />
            </ToonMesh>
          ))}
        </group>
      );
    default:
      return null;
  }
}
