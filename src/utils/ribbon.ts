import * as THREE from "three";

/** Builds a flat ribbon strip (a road or river surface) following a smooth curve through the given points. */
export function buildRibbonGeometry(
  points: THREE.Vector3[],
  width: number,
  segments = 200
): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
  const samples = curve.getPoints(segments);

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const tangent =
      i === 0
        ? samples[1].clone().sub(samples[0])
        : i === samples.length - 1
          ? samples[i].clone().sub(samples[i - 1])
          : samples[i + 1].clone().sub(samples[i - 1]);
    tangent.y = 0;
    tangent.normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);

    const left = p.clone().addScaledVector(normal, width / 2);
    const right = p.clone().addScaledVector(normal, -width / 2);

    positions.push(left.x, left.y, left.z, right.x, right.y, right.z);
    const v = i / (samples.length - 1);
    uvs.push(0, v * segments * 0.1, 1, v * segments * 0.1);

    if (i < samples.length - 1) {
      const a = i * 2;
      const b = i * 2 + 1;
      const c = i * 2 + 2;
      const d = i * 2 + 3;
      indices.push(a, b, c, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function buildCurve(points: THREE.Vector3[]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
}
