import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DISTRICTS } from "../data/districts";
import { useStore } from "../store/useStore";
import { Toon } from "./Toon";
import { Creature } from "./Creature";
import { Birds } from "./Birds";

const WORLD_RADIUS = 38;
const EXCLUSION = 6.5;

function randomPoint(rng: () => number): [number, number] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const angle = rng() * Math.PI * 2;
    const r = Math.sqrt(rng()) * WORLD_RADIUS;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const tooClose = DISTRICTS.some(
      (d) => Math.hypot(x - d.position[0], z - d.position[1]) < EXCLUSION
    ) || Math.hypot(x, z) < EXCLUSION;
    if (!tooClose) return [x, z];
  }
  return [0, 0];
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
  const treeCount = quality === "high" ? 90 : 40;
  const moteCount = quality === "high" ? 60 : 0;
  const grassCount = quality === "high" ? 240 : 60;
  const leafCount = quality === "high" ? 36 : 0;

  const treeRef = useRef<THREE.InstancedMesh>(null);
  const foliageRef = useRef<THREE.InstancedMesh>(null);
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
      x: (rng() - 0.5) * 64,
      z: (rng() - 0.5) * 64,
      y: rng() * 5 + 2,
      speed: 0.15 + rng() * 0.2,
      phase: rng() * Math.PI * 2,
      fall: 0.08 + rng() * 0.08,
    }));
  }, [leafCount]);

  const motes = useMemo(() => {
    const rng = mulberry32(99);
    return new Array(moteCount).fill(0).map(() => ({
      x: (rng() - 0.5) * 60,
      z: (rng() - 0.5) * 60,
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
      dummy.position.set(t.x, 1.6 * t.scale, t.z);
      dummy.updateMatrix();
      foliageRef.current?.setMatrixAt(i, dummy.matrix);
    });
    treeRef.current && (treeRef.current.instanceMatrix.needsUpdate = true);
    foliageRef.current && (foliageRef.current.instanceMatrix.needsUpdate = true);
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
      <instancedMesh ref={foliageRef} args={[undefined, undefined, treeCount]} castShadow>
        <coneGeometry args={[1.1, 2, 7]} />
        <Toon color="#5f8f5a" />
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
      <Creature position={[10.5, -14.5]} />
      <Creature position={[-14, 21.5]} />
    </group>
  );
}
