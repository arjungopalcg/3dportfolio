import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type * as THREE from "three";
import { getToonGradient } from "./toonGradient";
import { dayState } from "./dayCycle";

export function Toon({ color }: { color: string }) {
  return <meshToonMaterial color={color} gradientMap={getToonGradient()} />;
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
