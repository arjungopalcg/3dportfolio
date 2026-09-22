import * as THREE from "three";

export type LightingMode = "auto" | "day" | "golden" | "dusk";

/** Shared read target for anything that wants to react to time-of-day (e.g. lantern glow). */
export const dayState = { duskFactor: 0 };

interface Keyframe {
  sunPos: THREE.Vector3;
  sunColor: THREE.Color;
  sunIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  fogColor: THREE.Color;
  fogDensity: number;
  duskFactor: number;
}

const DAY: Keyframe = {
  sunPos: new THREE.Vector3(22, 28, 12),
  sunColor: new THREE.Color("#fff4da"),
  sunIntensity: 1.7,
  hemiSky: new THREE.Color("#cfe8ff"),
  hemiGround: new THREE.Color("#7a9b6e"),
  hemiIntensity: 0.8,
  fogColor: new THREE.Color("#cfe0d3"),
  fogDensity: 0.013,
  duskFactor: 0,
};

const GOLDEN: Keyframe = {
  sunPos: new THREE.Vector3(30, 16, 10),
  sunColor: new THREE.Color("#ffb877"),
  sunIntensity: 1.55,
  hemiSky: new THREE.Color("#ffd9a0"),
  hemiGround: new THREE.Color("#7a9b6e"),
  hemiIntensity: 0.7,
  fogColor: new THREE.Color("#e8bd82"),
  fogDensity: 0.017,
  duskFactor: 0.4,
};

const DUSK: Keyframe = {
  sunPos: new THREE.Vector3(34, 8, 6),
  sunColor: new THREE.Color("#ff8a5c"),
  sunIntensity: 0.85,
  hemiSky: new THREE.Color("#6a5a8a"),
  hemiGround: new THREE.Color("#4a5a3e"),
  hemiIntensity: 0.55,
  fogColor: new THREE.Color("#b98fa0"),
  fogDensity: 0.022,
  duskFactor: 1,
};

const KEYFRAMES: Keyframe[] = [DAY, GOLDEN, DUSK];

export const TARGET_PHASE: Record<Exclude<LightingMode, "auto">, number> = {
  day: 0,
  golden: 1 / 3,
  dusk: 2 / 3,
};

/** phase is 0..1, cycling through Day -> Golden -> Dusk -> (back to Day). */
export function sampleDayCycle(phase: number, out: {
  sunPos: THREE.Vector3;
  sunColor: THREE.Color;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  fogColor: THREE.Color;
}) {
  const p = ((phase % 1) + 1) % 1;
  const segment = p * KEYFRAMES.length;
  const i = Math.floor(segment) % KEYFRAMES.length;
  const j = (i + 1) % KEYFRAMES.length;
  const t = smoothstep(segment - i);
  const a = KEYFRAMES[i];
  const b = KEYFRAMES[j];

  out.sunPos.lerpVectors(a.sunPos, b.sunPos, t);
  out.sunColor.lerpColors(a.sunColor, b.sunColor, t);
  out.hemiSky.lerpColors(a.hemiSky, b.hemiSky, t);
  out.hemiGround.lerpColors(a.hemiGround, b.hemiGround, t);
  out.fogColor.lerpColors(a.fogColor, b.fogColor, t);

  return {
    sunIntensity: THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t),
    hemiIntensity: THREE.MathUtils.lerp(a.hemiIntensity, b.hemiIntensity, t),
    fogDensity: THREE.MathUtils.lerp(a.fogDensity, b.fogDensity, t),
    duskFactor: THREE.MathUtils.lerp(a.duskFactor, b.duskFactor, t),
  };
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}
