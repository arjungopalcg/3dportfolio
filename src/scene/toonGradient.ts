import * as THREE from "three";

let cached: THREE.DataTexture | null = null;

/** A 4-step gradient ramp for banded/toon-style lighting, shared across all toon materials. */
export function getToonGradient(): THREE.DataTexture {
  if (cached) return cached;
  const steps = new Uint8Array([60, 130, 195, 255]);
  const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cached = tex;
  return tex;
}
