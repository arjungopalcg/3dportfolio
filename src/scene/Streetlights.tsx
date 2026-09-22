import { useMemo } from "react";
import * as THREE from "three";
import { PLACES } from "../data/places";
import { buildCurve } from "../utils/ribbon";
import { Model } from "./kit/Model";
import { roads } from "./kit/paths";

const SPACING = 9;
const OFFSET = 3.4;

export function Streetlights() {
  const lights = useMemo(() => {
    const pts = PLACES.map((p) => new THREE.Vector3(p.position[0], 0, p.position[1]));
    const curve = buildCurve(pts);
    const length = curve.getLength();
    const count = Math.floor(length / SPACING);
    const out: { pos: THREE.Vector3; rotY: number }[] = [];
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const side = i % 2 === 0 ? 1 : -1;
      const pos = point.clone().addScaledVector(normal, OFFSET * side);
      const rotY = Math.atan2(normal.x * side, normal.z * side) + Math.PI;
      out.push({ pos, rotY });
    }
    return out;
  }, []);

  return (
    <group>
      {lights.map((l, i) => (
        <Model
          key={i}
          url={roads("light-square")}
          position={[l.pos.x, 0, l.pos.z]}
          rotation={[0, l.rotY, 0]}
        />
      ))}
    </group>
  );
}
