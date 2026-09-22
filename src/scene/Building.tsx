import type { BuildingSpec } from "../data/places";
import { Model } from "./kit/Model";
import { town, survival, industrial } from "./kit/paths";

const CHIMNEY_SPOTS: [number, number][] = [
  [0.3, 0.3],
  [-0.3, -0.3],
];

export function Building({ spec }: { spec: BuildingSpec }) {
  const scale = spec.scale ?? 1;

  if (spec.kind === "landmark" && spec.landmarkModel) {
    // windmill.glb is pivoted at its vertical center rather than its base — lift it
    // by half its native height (1.557 units) so it sits on the ground instead of
    // sinking halfway into it.
    const yOffset = spec.landmarkModel === "windmill" ? 1.557 * scale : 0;
    return <Model url={town(spec.landmarkModel)} scale={scale} position={[0, yOffset, 0]} />;
  }

  if (spec.kind === "camp") {
    return (
      <group scale={scale}>
        <Model url={survival("tent-canvas")} position={[0, 0, 0]} />
        <Model url={survival("campfire-pit")} position={[1.4, 0, 0.6]} scale={0.7} />
      </group>
    );
  }

  if (spec.kind === "industrial") {
    return (
      <group scale={scale}>
        <Model url={industrial(spec.landmarkModel ?? "building-a")} />
        {Array.from({ length: spec.chimneyCount ?? 0 }).map((_, i) => (
          <Model
            key={i}
            url={industrial("chimney-medium")}
            position={[0.7 + i * 0.5, 1.47, -0.7]}
            scale={0.8}
          />
        ))}
      </group>
    );
  }

  return (
    <group scale={scale}>
      {/* 4 walls around a 1x1 cell, same module rotated to each edge */}
      {spec.wall && (
        <>
          <Model url={town(spec.wall)} rotation={[0, 0, 0]} />
          <Model url={town(spec.wall)} rotation={[0, Math.PI / 2, 0]} />
          <Model url={town(spec.wall)} rotation={[0, Math.PI, 0]} />
        </>
      )}
      {spec.door && <Model url={town(spec.door)} rotation={[0, -Math.PI / 2, 0]} />}
      {spec.roof && <Model url={town(spec.roof)} position={[0, 1, 0]} />}
      {Array.from({ length: spec.chimneyCount ?? 0 }).map((_, i) => {
        const [cx, cz] = CHIMNEY_SPOTS[i] ?? [0.3, 0.3];
        return <Model key={i} url={town("chimney")} position={[cx, 1, cz]} />;
      })}
      {spec.banner && (
        <Model url={town("banner-red")} position={[0.5, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]} />
      )}
    </group>
  );
}
