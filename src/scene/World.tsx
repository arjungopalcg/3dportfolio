import { Suspense } from "react";
import { WORLD_POINTS } from "../data/districts";
import { District } from "./District";
import { Player } from "./Player";
import { Lighting } from "./Lighting";
import { AmbientLife } from "./AmbientLife";
import { Toon } from "./Toon";

export function World() {
  return (
    <>
      <Lighting />
      <Suspense fallback={null}>
        <Ground />
        {WORLD_POINTS.map((d) => (
          <District key={d.id} district={d} />
        ))}
        <AmbientLife />
        <Player />
      </Suspense>
    </>
  );
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[44, 48]} />
      <Toon color="#8fae6f" />
    </mesh>
  );
}
