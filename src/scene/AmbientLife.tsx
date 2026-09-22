import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PLACES } from "../data/places";
import { useStore } from "../store/useStore";
import { Toon } from "./Toon";
import { Creature } from "./Creature";
import { Birds } from "./Birds";

const BOUNDS = { xMin: -30, xMax: 82, zMin: -42, zMax: 58 };
const PLACE_CLEARANCE = 8;
const ROAD_CLEARANCE = 3.6;

function distanceToSegment(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const abx = bx - ax;
  const abz = bz - az;
  const lenSq = abx * abx + abz * abz || 1;
  let t = ((px - ax) * abx + (pz - az) * abz) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + abx * t;
  const cz = az + abz * t;
  return Math.hypot(px - cx, pz - cz);
}

function randomPoint(rng: () => number): [number, number] {
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = BOUNDS.xMin + rng() * (BOUNDS.xMax - BOUNDS.xMin);
    const z = BOUNDS.zMin + rng() * (BOUNDS.zMax - BOUNDS.zMin);
    const nearPlace = PLACES.some(
      (p) => Math.hypot(x - p.position[0], z - p.position[1]) < PLACE_CLEARANCE
    );
    if (nearPlace) continue;
    let nearRoad = false;
    for (let i = 0; i < PLACES.length - 1; i++) {
      const [ax, az] = PLACES[i].position;
      const [bx, bz] = PLACES[i + 1].position;
      if (distanceToSegment(x, z, ax, az, bx, bz) < ROAD_CLEARANCE) {
        nearRoad = true;
        break;
      }
    }
    if (!nearRoad) return [x, z];
  }
  return [BOUNDS.xMin, BOUNDS.zMin];
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function AmbientLife() {
  const quality = useStore((s) => s.settings.quality);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const treeCount = quality === "high" ? 130 : 55;
  const moteCount = quality === "high" ? 60 : 0;
  const grassCount = quality === "high" ? 320 : 80;
  const leafCount = quality === "high" ? 36 : 0;

  const treeRef = useRef<THREE.InstancedMesh>(null);
  const canopyLowRef = useRef<THREE.InstancedMesh>(null);
  const canopyMidRef = useRef<THREE.InstancedMesh>(null);
  const canopyTopRef = useRef<THREE.InstancedMesh>(null);
  const motesRef = useRef<THREE.InstancedMesh>(null);
  const grassRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => {
    const rng = mulberry32(1337);
    return new Array(treeCount).fill(0).map(() => {
      const [x, z] = randomPoint(rng);
      const scale = 0.8 + rng() * 0.9;
      return { x, z, scale, rot: rng() * Math.PI * 2 };
    });
  }, [treeCount]);

  const grass = useMemo(() => {
    const rng = mulberry32(4242);
    return new Array(grassCount).fill(0).map(() => {
      const [x, z] = randomPoint(rng);
      return {
        x,
        z,
        scale: 0.7 + rng() * 0.6,
        rot: rng() * Math.PI * 2,
        phase: rng() * Math.PI * 2,
      };
    });
  }, [grassCount]);

  const leaves = useMemo(() => {
    const rng = mulberry32(777);
    return new Array(leafCount).fill(0).map(() => ({
      x: BOUNDS.xMin + rng() * (BOUNDS.xMax - BOUNDS.xMin),
      z: BOUNDS.zMin + rng() * (BOUNDS.zMax - BOUNDS.zMin),
      y: rng() * 5 + 2,
      speed: 0.15 + rng() * 0.2,
      phase: rng() * Math.PI * 2,
      fall: 0.08 + rng() * 0.08,
    }));
  }, [leafCount]);

  const motes = useMemo(() => {
    const rng = mulberry32(99);
    return new Array(moteCount).fill(0).map(() => ({
      x: BOUNDS.xMin + rng() * (BOUNDS.xMax - BOUNDS.xMin),
      z: BOUNDS.zMin + rng() * (BOUNDS.zMax - BOUNDS.zMin),
      y: rng() * 4 + 0.5,
      speed: 0.2 + rng() * 0.3,
      phase: rng() * Math.PI * 2,
    }));
  }, [moteCount]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useMemo(() => {
    trees.forEach((t, i) => {
      dummy.position.set(t.x, 0, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      treeRef.current?.setMatrixAt(i, dummy.matrix);

      // layered canopy: three overlapping, tapering blobs instead of one cone
      dummy.position.set(t.x, 1.55 * t.scale, t.z);
      dummy.scale.setScalar(t.scale * 1.05);
      dummy.updateMatrix();
      canopyLowRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x + Math.sin(i) * 0.15 * t.scale, 2.15 * t.scale, t.z + Math.cos(i) * 0.15 * t.scale);
      dummy.scale.setScalar(t.scale * 0.82);
      dummy.updateMatrix();
      canopyMidRef.current?.setMatrixAt(i, dummy.matrix);

      dummy.position.set(t.x, 2.65 * t.scale, t.z);
      dummy.scale.setScalar(t.scale * 0.58);
      dummy.updateMatrix();
      canopyTopRef.current?.setMatrixAt(i, dummy.matrix);
    });
    treeRef.current && (treeRef.current.instanceMatrix.needsUpdate = true);
    canopyLowRef.current && (canopyLowRef.current.instanceMatrix.needsUpdate = true);
    canopyMidRef.current && (canopyMidRef.current.instanceMatrix.needsUpdate = true);
    canopyTopRef.current && (canopyTopRef.current.instanceMatrix.needsUpdate = true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trees]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (motesRef.current && !reducedMotion) {
      motes.forEach((m, i) => {
        dummy.position.set(
          m.x + Math.sin(t * m.speed + m.phase) * 1.2,
          m.y + Math.sin(t * 0.6 + m.phase) * 0.4,
          m.z + Math.cos(t * m.speed + m.phase) * 1.2
        );
        dummy.scale.setScalar(1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        motesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      motesRef.current.instanceMatrix.needsUpdate = true;
    }

    if (grassRef.current) {
      const sway = reducedMotion ? 0 : Math.sin(t * 1.4) * 0.18;
      grass.forEach((g, i) => {
        dummy.position.set(g.x, 0, g.z);
        dummy.rotation.set(0, g.rot, reducedMotion ? 0 : sway * Math.sin(g.phase));
        dummy.scale.setScalar(g.scale);
        dummy.updateMatrix();
        grassRef.current!.setMatrixAt(i, dummy.matrix);
      });
      grassRef.current.instanceMatrix.needsUpdate = true;
    }

    if (leavesRef.current && !reducedMotion) {
      leaves.forEach((l, i) => {
        const y = ((l.y - t * l.fall) % 6 + 6) % 6;
        dummy.position.set(l.x + Math.sin(t * l.speed + l.phase) * 1.5, y, l.z);
        dummy.rotation.set(t * 0.5 + l.phase, t * 0.3, 0);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        leavesRef.current!.setMatrixAt(i, dummy.matrix);
      });
      leavesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={treeRef} args={[undefined, undefined, treeCount]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 1.6, 6]} />
        <Toon color="#7a5a3c" />
      </instancedMesh>
      <instancedMesh ref={canopyLowRef} args={[undefined, undefined, treeCount]} castShadow>
        <sphereGeometry args={[1.15, 8, 7]} />
        <Toon color="#4f7f52" />
      </instancedMesh>
      <instancedMesh ref={canopyMidRef} args={[undefined, undefined, treeCount]} castShadow>
        <sphereGeometry args={[1.0, 8, 7]} />
        <Toon color="#5f8f5a" />
      </instancedMesh>
      <instancedMesh ref={canopyTopRef} args={[undefined, undefined, treeCount]} castShadow>
        <sphereGeometry args={[0.85, 8, 7]} />
        <Toon color="#77a56a" />
      </instancedMesh>
      {grassCount > 0 && (
        <instancedMesh ref={grassRef} args={[undefined, undefined, grassCount]}>
          <coneGeometry args={[0.06, 0.45, 3]} />
          <Toon color="#6f9b5c" />
        </instancedMesh>
      )}
      {leafCount > 0 && (
        <instancedMesh ref={leavesRef} args={[undefined, undefined, leafCount]}>
          <planeGeometry args={[0.16, 0.16]} />
          <meshStandardMaterial color="#d9a75c" side={THREE.DoubleSide} flatShading />
        </instancedMesh>
      )}
      {moteCount > 0 && (
        <instancedMesh ref={motesRef} args={[undefined, undefined, moteCount]}>
          <sphereGeometry args={[0.045, 6, 6]} />
          <meshStandardMaterial
            color="#fff2c8"
            emissive="#fff2c8"
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </instancedMesh>
      )}
      {quality === "high" && <Birds count={6} />}
      <Creature position={[-10, 8]} />
      <Creature position={[38, 26]} />
    </group>
  );
}
