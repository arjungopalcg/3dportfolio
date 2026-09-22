import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { ThreeElements } from "@react-three/fiber";

interface ModelProps extends Omit<ThreeElements["primitive"], "object"> {
  url: string;
}

/** Loads a Kenney GLB and renders an independent clone (so the same asset can be reused many times). */
export function Model({ url, ...props }: ModelProps) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={cloned} {...props} />;
}

export function preloadModels(urls: string[]) {
  urls.forEach((u) => useGLTF.preload(u));
}
