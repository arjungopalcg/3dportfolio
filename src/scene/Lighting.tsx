import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store/useStore";
import { sampleDayCycle, dayState, TARGET_PHASE } from "./dayCycle";

const CYCLE_SECONDS = 280;
const FROZEN_PHASE = TARGET_PHASE.golden;

export function Lighting() {
  const quality = useStore((s) => s.settings.quality);
  const lightingMode = useStore((s) => s.settings.lightingMode);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const shadows = quality === "high";

  const sunRef = useRef<THREE.DirectionalLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const fogRef = useRef<THREE.FogExp2>(null);
  const currentPhase = useRef(FROZEN_PHASE);
  const { scene } = useThree();

  const sample = useRef({
    sunPos: new THREE.Vector3(),
    sunColor: new THREE.Color(),
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    fogColor: new THREE.Color(),
  }).current;

  useFrame((state, delta) => {
    const targetPhase =
      lightingMode === "auto"
        ? reducedMotion
          ? FROZEN_PHASE
          : (state.clock.elapsedTime % CYCLE_SECONDS) / CYCLE_SECONDS
        : TARGET_PHASE[lightingMode];

    if (lightingMode === "auto" && !reducedMotion) {
      currentPhase.current = targetPhase;
    } else {
      // Ease toward a fixed target so switching modes glides like a sunset, not a snap.
      const diff = shortestDelta(currentPhase.current, targetPhase);
      const speed = reducedMotion ? 1 : Math.min(1, delta * 0.35);
      currentPhase.current = (currentPhase.current + diff * speed + 1) % 1;
    }

    const result = sampleDayCycle(currentPhase.current, sample);
    dayState.duskFactor = result.duskFactor;

    if (sunRef.current) {
      sunRef.current.position.copy(sample.sunPos);
      sunRef.current.color.copy(sample.sunColor);
      sunRef.current.intensity = result.sunIntensity;
    }
    if (hemiRef.current) {
      hemiRef.current.color.copy(sample.hemiSky);
      hemiRef.current.groundColor.copy(sample.hemiGround);
      hemiRef.current.intensity = result.hemiIntensity;
    }
    if (fogRef.current) {
      fogRef.current.color.copy(sample.fogColor);
      fogRef.current.density = result.fogDensity;
    }
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(sample.fogColor);
    }
  });

  return (
    <>
      <hemisphereLight ref={hemiRef} args={["#fdf0d5", "#7a9b6e", 0.75]} />
      <directionalLight
        ref={sunRef}
        position={[22, 26, 12]}
        intensity={1.6}
        color="#ffdca8"
        castShadow={shadows}
        shadow-mapSize={[shadows ? 1024 : 256, shadows ? 1024 : 256]}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={45}
        shadow-camera-bottom={-45}
        shadow-camera-far={90}
        shadow-bias={-0.0015}
      />
      <ambientLight intensity={0.28} color="#e8d9c0" />
      <fogExp2 ref={fogRef} attach="fog" args={["#e9dcc4", 0.018]} />
    </>
  );
}

function shortestDelta(from: number, to: number) {
  let diff = to - from;
  diff = ((diff + 0.5) % 1) - 0.5;
  if (diff < -0.5) diff += 1;
  return diff;
}
