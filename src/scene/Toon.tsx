import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getToonGradient } from "./toonGradient";
import { dayState } from "./dayCycle";
import { useStore } from "../store/useStore";

export function Toon({ color, side }: { color: string; side?: THREE.Side }) {
  return <meshToonMaterial color={color} gradientMap={getToonGradient()} side={side} />;
}

const OUTLINE_SCALE = 1.055;

interface ToonMeshProps {
  color: string;
  children: ReactNode; // a geometry element, e.g. <coneGeometry args={[...]} />
  castShadow?: boolean;
  receiveShadow?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
}

/**
 * A colored toon-shaded mesh plus a slightly-inflated black backface shell behind it —
 * the classic "inverted hull" trick for hand-inked outlines (as in Wind Waker-style rendering).
 */
export function ToonMesh({
  color,
  children,
  castShadow,
  receiveShadow,
  position,
  rotation,
  scale,
}: ToonMeshProps) {
  const outlines = useStore((s) => s.settings.quality !== "low");

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh castShadow={castShadow} receiveShadow={receiveShadow}>
        {children}
        <Toon color={color} />
      </mesh>
      {outlines && (
        <mesh scale={OUTLINE_SCALE} renderOrder={-1}>
          {children}
          <meshBasicMaterial color="#1a1410" side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
}

export function Glow({
  color,
  intensity = 1,
}: {
  color: string;
  intensity?: number;
}) {
  const ref = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (ref.current) {
      ref.current.emissiveIntensity = intensity * (1 + dayState.duskFactor * 1.1);
    }
  });

  return (
    <meshStandardMaterial
      ref={ref}
      color={color}
      emissive={color}
      emissiveIntensity={intensity}
      toneMapped={false}
    />
  );
}
