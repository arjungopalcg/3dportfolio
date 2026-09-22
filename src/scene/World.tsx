import { Suspense } from "react";
import { DISTRICTS } from "../data/districts";
import { District } from "./District";
import { Player } from "./Player";
import { Lighting } from "./Lighting";
import { AmbientLife } from "./AmbientLife";

export function World() {
  return (
    <>
      <Lighting />
      <Suspense fallback={null}>
        <Ground />
        <HubMarker />
        {DISTRICTS.map((d) => (
          <District key={d.id} district={d} />
        ))}
        <AmbientLife />
        <Player />
      </Suspense>
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[44, 48]} />
      <meshStandardMaterial color="#8fae6f" roughness={1} />
    </mesh>
  );
}

function HubMarker() {
  return (
    <group position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[6, 32]} />
        <meshStandardMaterial color="#e8d9b0" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 2.2, 8]} />
        <meshStandardMaterial color="#8a6a45" flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.5, 0]}>
        <sphereGeometry args={[0.5, 12, 10]} />
        <meshStandardMaterial
          color="#f4b79f"
          emissive="#f4b79f"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
