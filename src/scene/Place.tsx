import { useRef, useEffect } from "react";
import * as THREE from "three";
import type { Place as PlaceData } from "../data/places";
import { registerCollidable, unregisterCollidable } from "./collidables";
import { useStore } from "../store/useStore";
import { Toon, Glow, ToonMesh } from "./Toon";
import { Label } from "./Label";
import { Building } from "./Building";
import { Model } from "./kit/Model";

interface Props {
  place: PlaceData;
}

const PLAZA_RADIUS = 4.6;

/** A single stop along the road: a plaza, a name-board signpost, and a memory wall of framed placeholders. */
export function PlaceMarker({ place }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const nearby = useStore((s) => s.nearbyPlace === place.id);

  useEffect(() => {
    const g = groupRef.current;
    if (g) registerCollidable(g);
    return () => {
      if (g) unregisterCollidable(g);
    };
  }, []);

  const [x, z] = place.position;
  const slotCount = Math.max(1, Math.min(place.wallItems.length, 4));
  const wallWidth = 1.1 + slotCount * 1.05;

  return (
    <group ref={groupRef} position={[x, 0, z]}>
      {/* plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[PLAZA_RADIUS, 28]} />
        <Toon color={place.accent} />
      </mesh>

      {/* the place itself */}
      <group position={[-2.6, 0, -1.8]} scale={2.4}>
        <Building spec={place.building} />
      </group>

      {/* signpost with the place name */}
      <ToonMesh castShadow position={[0, 1.1, -2.6]} color="#7a5a3c">
        <cylinderGeometry args={[0.1, 0.13, 2.2, 8]} />
      </ToonMesh>
      <ToonMesh castShadow position={[0, 2.3, -2.6]} color={place.color}>
        <boxGeometry args={[2.7, 0.85, 0.14]} />
      </ToonMesh>
      <group position={[0, 2.42, -2.5]}>
        <Label text={place.name} width={2.5} height={0.5} fontSize={56} weight={700} />
      </group>
      <group position={[0, 2.06, -2.5]}>
        <Label
          text={place.tagline}
          width={2.5}
          height={0.24}
          fontSize={26}
          weight={400}
          color="#fff2e0"
        />
      </group>

      {/* memory wall: framed placeholders for photos / blog entries */}
      <ToonMesh castShadow receiveShadow position={[0, 1.05, 1.8]} color="#e8dcc4">
        <boxGeometry args={[wallWidth, 2.1, 0.22]} />
      </ToonMesh>
      {place.wallItems.slice(0, slotCount).map((_item, i) => {
        const spacing = wallWidth / (slotCount + 1);
        const sx = -wallWidth / 2 + spacing * (i + 1);
        return (
          <group key={i} position={[sx, 1.2, 1.92]}>
            {/* frame */}
            <mesh>
              <planeGeometry args={[spacing * 0.8, 1.12]} />
              <meshStandardMaterial color="#fff8ea" />
            </mesh>
            {/* placeholder photo */}
            <mesh position={[0, 0, 0.002]}>
              <planeGeometry args={[spacing * 0.66, 0.92]} />
              <meshStandardMaterial color={place.color} />
            </mesh>
          </group>
        );
      })}
      <group position={[0, 0.12, 1.94]}>
        <Label
          text="photos & notes — tap to open"
          width={wallWidth - 0.4}
          height={0.22}
          fontSize={24}
          weight={400}
          color="#5a4a3a"
        />
      </group>

      {/* interaction glow marker */}
      <mesh position={[0, 2.6, 2.9]}>
        <sphereGeometry args={[nearby ? 0.28 : 0.2, 12, 12]} />
        <Glow color={place.accent} intensity={nearby ? 2.2 : 1.1} />
      </mesh>

      {/* small decorative props */}
      {place.extras?.map((extra, i) => (
        <Model
          key={i}
          url={extra.url}
          position={[extra.position[0], 0, extra.position[1]]}
          rotation={[0, extra.rotation ?? 0, 0]}
          scale={extra.scale ?? 1}
        />
      ))}
    </group>
  );
}
