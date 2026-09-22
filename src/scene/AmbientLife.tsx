import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { PLACES } from "../data/places";
import { useStore } from "../store/useStore";
import { Creature } from "./Creature";
import { Birds } from "./Birds";
import { forest } from "./kit/paths";
import { Toon } from "./Toon";

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

function firstMesh(scene: THREE.Object3D): THREE.Mesh | null {
  let found: THREE.Mesh | null = null;
  scene.traverse((obj) => {
    if (!found && obj instanceof THREE.Mesh) found = obj;
  });
  return found;
}

/** An InstancedMesh built from a loaded Kenney model's geometry+material — real assets, still one draw call. */
function InstancedModel({
  url,
  count,
  place,
}: {
  url: string;
  count: number;
  place: (i: number, dummy: THREE.Object3D) => void;
}) {
  const { scene } = useGLTF(url);
  const mesh = useMemo(() => firstMesh(scene), [scene]);
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useMemo(() => {
    if (!ref.current) return;
    for (let i = 0; i < count; i++) {
      place(i, dummy);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, mesh]);

  if (!mesh || count <= 0) return null;
  return (
    <instancedMesh
      ref={ref}
      args={[mesh.geometry, mesh.material, count]}
      castShadow
      receiveShadow
    />
  );
}

export function AmbientLife() {
  const quality = useStore((s) => s.settings.quality);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const treeCount = quality === "high" ? 70 : 26;
  const rockCount = quality === "high" ? 22 : 8;
  const grassCount = quality === "high" ? 260 : 60;
  const moteCount = quality === "high" ? 60 : 0;
  const leafCount = quality === "high" ? 36 : 0;

  const motesRef = useRef<THREE.InstancedMesh>(null);
  const leavesRef = useRef<THREE.InstancedMesh>(null);
  const grassRef = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => {
    const rng = mulberry32(1337);
    return new Array(treeCount).fill(0).map(() => {
      const [x, z] = randomPoint(rng);
      return { x, z, scale: 0.8 + rng() * 0.9, rot: rng() * Math.PI * 2 };
    });
  }, [treeCount]);

  const rocks = useMemo(() => {
    const rng = mulberry32(2468);
    return new Array(rockCount).fill(0).map(() => {
      const [x, z] = randomPoint(rng);
      return { x, z, scale: 0.6 + rng() * 0.8, rot: rng() * Math.PI * 2 };
    });
  }, [rockCount]);

  const grass = useMemo(() => {
    const rng = mulberry32(4242);
    return new Array(grassCount).fill(0).map(() => {
      const [x, z] = randomPoint(rng);
      return { x, z, scale: 0.7 + rng() * 0.6, rot: rng() * Math.PI * 2, phase: rng() * Math.PI * 2 };
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

  const treeSplit = Math.ceil(trees.length / 2);

  return (
    <group>
      <InstancedModel
        url={forest("tree")}
        count={treeSplit}
        place={(i, d) => {
          const t = trees[i];
          d.position.set(t.x, 0, t.z);
          d.rotation.set(0, t.rot, 0);
          d.scale.setScalar(t.scale);
        }}
      />
      <InstancedModel
        url={forest("tree-high")}
        count={trees.length - treeSplit}
        place={(i, d) => {
          const t = trees[i + treeSplit];
          d.position.set(t.x, 0, t.z);
          d.rotation.set(0, t.rot, 0);
          d.scale.setScalar(t.scale);
        }}
      />
      <InstancedModel
        url={forest("rocks-low")}
        count={rockCount}
        place={(i, d) => {
          const r = rocks[i];
          d.position.set(r.x, 0, r.z);
          d.rotation.set(0, r.rot, 0);
          d.scale.setScalar(r.scale);
        }}
      />
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
