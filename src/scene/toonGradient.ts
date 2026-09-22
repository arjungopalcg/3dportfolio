import * as THREE from "three";

let cached: THREE.DataTexture | null = null;

/** A flat, high-contrast 3-step gradient ramp for graphic-novel-style toon lighting. */
export function getToonGradient(): THREE.DataTexture {
  if (cached) return cached;
  const steps = new Uint8Array([80, 205, 255]);
  const tex = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cached = tex;
  return tex;
}
