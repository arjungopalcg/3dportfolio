import { useMemo } from "react";
import * as THREE from "three";
import { buildRibbonGeometry } from "../utils/ribbon";
import { Toon, ToonMesh } from "./Toon";

const SPAN = 9;
const RISE = 2.1;
const DECK_WIDTH = 2.2;
const SEGMENTS = 10;

interface BridgeProps {
  position: [number, number];
  rotationY?: number;
}

/** A static arched footbridge — a visual landmark over the river, built along local +X. */
export function Bridge({ position, rotationY = 0 }: BridgeProps) {
  const deckGeometry = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      const t = i / SEGMENTS;
      const localX = (t - 0.5) * SPAN;
      const y = RISE * (1 - Math.pow((t - 0.5) * 2, 2)) + 0.05;
      pts.push(new THREE.Vector3(localX, y, 0));
    }
    return buildRibbonGeometry(pts, DECK_WIDTH, SEGMENTS);
  }, []);

  const railPosts = useMemo(() => {
    const posts: { x: number; y: number }[] = [];
    for (let i = 1; i < SEGMENTS; i += 2) {
      const t = i / SEGMENTS;
      const localX = (t - 0.5) * SPAN;
      const y = RISE * (1 - Math.pow((t - 0.5) * 2, 2)) + 0.05;
      posts.push({ x: localX, y });
    }
    return posts;
  }, []);

  return (
    <group position={[position[0], 0, position[1]]} rotation={[0, rotationY, 0]}>
      <mesh geometry={deckGeometry} castShadow receiveShadow>
        <Toon color="#a9906a" />
      </mesh>
      {railPosts.map((p, i) => (
        <group key={i}>
          <ToonMesh position={[p.x, p.y + 0.4, DECK_WIDTH / 2]} color="#8a6a45">
            <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
          </ToonMesh>
          <ToonMesh position={[p.x, p.y + 0.4, -DECK_WIDTH / 2]} color="#8a6a45">
            <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
          </ToonMesh>
        </group>
      ))}
    </group>
  );
}
