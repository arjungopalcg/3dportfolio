import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { PLACES, SPAWN_POINT } from "../data/places";
import { useStore } from "../store/useStore";
import { input, consumeInteract, consumeLook } from "../input/inputState";
import { collidableMeshes } from "./collidables";
import { playerWorld } from "./playerPosition";
import { ToonMesh } from "./Toon";

const WALK_BOUNDS = { xMin: -34, xMax: 86, zMin: -46, zMax: 62 };
const PLACE_RADIUS = 4.2;
const PLAYER_RADIUS = 0.5;
const INTERACT_RADIUS = 5.5;
const CAMERA_DISTANCE = 7;
const CAMERA_HEIGHT = 3.6;
const MOVE_SPEED = 6.5;
const WALK_CYCLE_SPEED = 9;
const MAX_LIMB_SWING = 0.65;

const placeVecs = PLACES.map((p) => new THREE.Vector3(p.position[0], 0, p.position[1]));

export function Player({ startYaw = Math.PI }: { startYaw?: number }) {
  const bodyRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const meshYaw = useRef(startYaw);
  const yaw = useRef(startYaw);
  const position = useRef(new THREE.Vector3(SPAWN_POINT[0], 0, SPAWN_POINT[1]));
  const walkCycle = useRef(0);
  const walkIntensity = useRef(0);
  const { camera, raycaster } = useThree();

  const openPanel = useStore((s) => s.openPanel);
  const markVisited = useStore((s) => s.markVisited);
  const setNearbyPlace = useStore((s) => s.setNearbyPlace);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const teleportTarget = useStore((s) => s.teleportTarget);
  const clearTeleport = useStore((s) => s.clearTeleport);

  useFrame((_state, delta) => {
    if (teleportTarget) {
      position.current.set(teleportTarget[0], 0, teleportTarget[1]);
      clearTeleport();
    }
    const dt = Math.min(delta, 0.05);

    // Look
    const [dx] = consumeLook();
    yaw.current -= dx * 0.006;

    // Movement basis derived from camera yaw
    const forward = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current));
    const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

    const moveX = clamp(input.moveX, -1, 1);
    const moveY = clamp(input.moveY, -1, 1);

    const moveDir = new THREE.Vector3();
    moveDir.addScaledVector(forward, moveY);
    moveDir.addScaledVector(right, moveX);
    const moving = moveDir.lengthSq() > 0.0001;
    if (moving) {
      if (moveDir.length() > 1) moveDir.normalize();
      const speed = MOVE_SPEED * (reducedMotion ? 0.85 : 1);
      const next = position.current.clone().addScaledVector(moveDir, speed * dt);

      // Place collision (push out)
      placeVecs.forEach((v) => {
        const d = next.distanceTo(v);
        const minDist = PLACE_RADIUS + PLAYER_RADIUS;
        if (d < minDist && d > 0.0001) {
          const push = next.clone().sub(v).normalize().multiplyScalar(minDist - d);
          next.add(push);
        }
      });
      // World boundary (rectangular, spans the whole road corridor)
      next.x = clamp(next.x, WALK_BOUNDS.xMin, WALK_BOUNDS.xMax);
      next.z = clamp(next.z, WALK_BOUNDS.zMin, WALK_BOUNDS.zMax);

      position.current.copy(next);

      const targetMeshYaw = Math.atan2(moveDir.x, moveDir.z);
      meshYaw.current = lerpAngle(meshYaw.current, targetMeshYaw, reducedMotion ? 1 : 0.22);
    }

    // Walk-cycle animation
    walkIntensity.current +=
      ((moving ? 1 : 0) - walkIntensity.current) * Math.min(1, dt * 8);
    if (moving) walkCycle.current += dt * WALK_CYCLE_SPEED;
    const swing = reducedMotion ? 0 : Math.sin(walkCycle.current) * MAX_LIMB_SWING * walkIntensity.current;
    if (leftArmRef.current) leftArmRef.current.rotation.x = -swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

    if (bodyRef.current) {
      bodyRef.current.position.set(position.current.x, 0, position.current.z);
      bodyRef.current.rotation.y = meshYaw.current;
      bodyRef.current.position.y = reducedMotion ? 0 : Math.abs(Math.sin(walkCycle.current * 2)) * 0.05 * walkIntensity.current;
    }
    playerWorld.x = position.current.x;
    playerWorld.z = position.current.z;
    playerWorld.yaw = yaw.current;

    // Nearest place / interaction
    let nearestId: string | null = null;
    let nearestDist = Infinity;
    PLACES.forEach((p, i) => {
      const dist = position.current.distanceTo(placeVecs[i]);
      if (dist < INTERACT_RADIUS && dist < nearestDist) {
        nearestDist = dist;
        nearestId = p.id;
      }
    });
    setNearbyPlace(nearestId);

    if (consumeInteract() && nearestId) {
      openPanel(nearestId);
      markVisited(nearestId);
    }

    // Camera: desired position behind player along -forward (forward = where W moves)
    const desired = position.current
      .clone()
      .addScaledVector(forward, -CAMERA_DISTANCE)
      .add(new THREE.Vector3(0, CAMERA_HEIGHT, 0));

    // Simple camera collision: raycast from player eye toward desired cam pos
    let camDistance = CAMERA_DISTANCE;
    if (collidableMeshes.length > 0) {
      const eye = position.current.clone().add(new THREE.Vector3(0, 1.4, 0));
      const toCam = desired.clone().sub(eye);
      const fullDist = toCam.length();
      if (fullDist > 0.001) {
        raycaster.set(eye, toCam.normalize());
        raycaster.far = fullDist;
        const hits = raycaster.intersectObjects(collidableMeshes, true);
        if (hits.length > 0 && hits[0].distance < fullDist) {
          camDistance = Math.max(2.2, (hits[0].distance / fullDist) * CAMERA_DISTANCE - 0.4);
        }
      }
    }
    const camTarget = position.current
      .clone()
      .addScaledVector(forward, -camDistance)
      .add(new THREE.Vector3(0, CAMERA_HEIGHT, 0));

    const lerpFactor = reducedMotion ? 1 : 1 - Math.pow(0.001, dt);
    camera.position.lerp(camTarget, lerpFactor);
    const lookTarget = position.current.clone().add(new THREE.Vector3(0, 1.4, 0));
    const currentLook = camera.position
      .clone()
      .add(camera.getWorldDirection(new THREE.Vector3()));
    const newLook = currentLook.lerp(lookTarget, lerpFactor);
    camera.lookAt(newLook);
  });

  return (
    <group ref={bodyRef}>
      {/* torso — red jacket */}
      <ToonMesh castShadow position={[0, 1.02, 0]} color="#c9433f">
        <capsuleGeometry args={[0.26, 0.5, 4, 8]} />
      </ToonMesh>
      {/* skirt */}
      <ToonMesh castShadow position={[0, 0.62, 0]} color="#2a2420">
        <coneGeometry args={[0.32, 0.42, 10]} />
      </ToonMesh>
      {/* head */}
      <ToonMesh castShadow position={[0, 1.62, 0]} color="#f2c9a0">
        <sphereGeometry args={[0.24, 12, 10]} />
      </ToonMesh>
      {/* hair */}
      <ToonMesh castShadow position={[0, 1.68, -0.02]} color="#2e2420">
        <sphereGeometry args={[0.27, 12, 10]} />
      </ToonMesh>
      <ToonMesh castShadow position={[0, 1.55, 0.2]} color="#f2c9a0">
        <sphereGeometry args={[0.2, 10, 8]} />
      </ToonMesh>

      {/* left arm (shoulder pivot) */}
      <group ref={leftArmRef} position={[-0.32, 1.3, 0]}>
        <ToonMesh castShadow position={[0, -0.26, 0]} color="#c9433f">
          <cylinderGeometry args={[0.07, 0.08, 0.5, 6]} />
        </ToonMesh>
        <ToonMesh castShadow position={[0, -0.54, 0]} color="#f2c9a0">
          <sphereGeometry args={[0.08, 8, 8]} />
        </ToonMesh>
      </group>
      {/* right arm */}
      <group ref={rightArmRef} position={[0.32, 1.3, 0]}>
        <ToonMesh castShadow position={[0, -0.26, 0]} color="#c9433f">
          <cylinderGeometry args={[0.07, 0.08, 0.5, 6]} />
        </ToonMesh>
        <ToonMesh castShadow position={[0, -0.54, 0]} color="#f2c9a0">
          <sphereGeometry args={[0.08, 8, 8]} />
        </ToonMesh>
      </group>

      {/* left leg (hip pivot) */}
      <group ref={leftLegRef} position={[-0.14, 0.5, 0]}>
        <ToonMesh castShadow position={[0, -0.28, 0]} color="#2a2420">
          <cylinderGeometry args={[0.09, 0.09, 0.56, 6]} />
        </ToonMesh>
        <ToonMesh castShadow position={[0, -0.58, 0.06]} color="#1c1815">
          <boxGeometry args={[0.14, 0.1, 0.24]} />
        </ToonMesh>
      </group>
      {/* right leg */}
      <group ref={rightLegRef} position={[0.14, 0.5, 0]}>
        <ToonMesh castShadow position={[0, -0.28, 0]} color="#2a2420">
          <cylinderGeometry args={[0.09, 0.09, 0.56, 6]} />
        </ToonMesh>
        <ToonMesh castShadow position={[0, -0.58, 0.06]} color="#1c1815">
          <boxGeometry args={[0.14, 0.1, 0.24]} />
        </ToonMesh>
      </group>
    </group>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function lerpAngle(a: number, b: number, t: number) {
  let diff = b - a;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return a + diff * t;
}
