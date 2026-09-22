import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { PLACES, SPAWN_POINT } from "../data/places";
import { useStore } from "../store/useStore";
import { input, consumeInteract, consumeLook } from "../input/inputState";
import { collidableMeshes } from "./collidables";
import { playerWorld } from "./playerPosition";
import { character } from "./kit/paths";

const WALK_BOUNDS = { xMin: -34, xMax: 86, zMin: -46, zMax: 62 };
const PLACE_RADIUS = 4.2;
const PLAYER_RADIUS = 0.5;
const INTERACT_RADIUS = 5.5;
const CAMERA_DISTANCE = 7;
const CAMERA_HEIGHT = 3.6;
const MOVE_SPEED = 6.5;
const CHARACTER_SCALE = 0.5;
const CHARACTER_URL = character("a");

useGLTF.preload(CHARACTER_URL);

const placeVecs = PLACES.map((p) => new THREE.Vector3(p.position[0], 0, p.position[1]));

export function Player({ startYaw = Math.PI }: { startYaw?: number }) {
  const bodyRef = useRef<THREE.Group>(null);
  const characterRef = useRef<THREE.Group>(null);
  const meshYaw = useRef(startYaw);
  const yaw = useRef(startYaw);
  const position = useRef(new THREE.Vector3(SPAWN_POINT[0], 0, SPAWN_POINT[1]));
  const walkIntensity = useRef(0);
  const { camera, raycaster } = useThree();

  const { scene, animations } = useGLTF(CHARACTER_URL);
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.castShadow = true;
    });
    return clone;
  }, [scene]);
  const { actions } = useAnimations(animations, characterRef);

  useEffect(() => {
    const idle = actions.idle;
    const walk = actions.walk;
    idle?.reset().play();
    walk?.reset().play();
    if (idle) idle.weight = 1;
    if (walk) walk.weight = 0;
  }, [actions]);

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

    // Crossfade idle <-> walk animation weights
    walkIntensity.current += ((moving ? 1 : 0) - walkIntensity.current) * Math.min(1, dt * 8);
    const idle = actions.idle;
    const walk = actions.walk;
    if (idle && walk) {
      const w = reducedMotion ? (moving ? 1 : 0) : walkIntensity.current;
      idle.weight = 1 - w;
      walk.weight = w;
    }

    if (bodyRef.current) {
      bodyRef.current.position.set(position.current.x, 0, position.current.z);
      bodyRef.current.rotation.y = meshYaw.current;
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
      <group ref={characterRef} scale={CHARACTER_SCALE}>
        <primitive object={clonedScene} />
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
