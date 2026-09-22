import { useMemo } from "react";
import * as THREE from "three";
import { PLACES } from "../data/places";
import { buildRibbonGeometry } from "../utils/ribbon";
import { Toon } from "./Toon";

const ROAD_WIDTH = 4.2;

export function Road() {
  const geometry = useMemo(() => {
    const pts = PLACES.map((p) => new THREE.Vector3(p.position[0], 0.03, p.position[1]));
    return buildRibbonGeometry(pts, ROAD_WIDTH);
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <Toon color="#d8c39a" />
    </mesh>
  );
}
