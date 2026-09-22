import { useEffect, useRef } from "react";
import { DISTRICTS, approachPoint } from "../data/districts";
import { useStore } from "../store/useStore";
import { playerWorld } from "../scene/playerPosition";

const WORLD_RADIUS = 30; // matches spread of district positions
const MAP_SIZE = 168;

function worldToMap(x: number, z: number) {
  const scale = MAP_SIZE / 2 / WORLD_RADIUS;
  return {
    left: MAP_SIZE / 2 + x * scale,
    top: MAP_SIZE / 2 + z * scale,
  };
}

export function Minimap() {
  const minimapOpen = useStore((s) => s.minimapOpen);
  const toggleMinimap = useStore((s) => s.toggleMinimap);
  const requestTeleport = useStore((s) => s.requestTeleport);
  const visited = useStore((s) => s.visited);
  const playerDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!minimapOpen) return;
    let raf: number;
    const tick = () => {
      const pos = worldToMap(playerWorld.x, playerWorld.z);
      if (playerDotRef.current) {
        playerDotRef.current.style.left = `${pos.left}px`;
        playerDotRef.current.style.top = `${pos.top}px`;
        playerDotRef.current.style.transform = `translate(-50%, -50%) rotate(${playerWorld.yaw}rad)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [minimapOpen]);

  const fastTravel = (x: number, z: number) => {
    requestTeleport([x, z]);
  };

  if (!minimapOpen) {
    return (
      <button className="minimap-toggle" onClick={toggleMinimap} aria-label="Show minimap">
        Map
      </button>
    );
  }

  return (
    <div className="minimap" role="group" aria-label="Minimap — fast travel">
      <button className="minimap-close" onClick={toggleMinimap} aria-label="Hide minimap">
        ×
      </button>
      <div className="minimap-canvas" style={{ width: MAP_SIZE, height: MAP_SIZE }}>
        <button
          className="minimap-dot hub"
          style={worldToMap(0, 0)}
          title="Village Square"
          onClick={() => fastTravel(0, 8)}
        />
        {DISTRICTS.map((d) => {
          const pos = worldToMap(d.position[0], d.position[1]);
          const seen = visited.has(d.id);
          const [tx, tz] = approachPoint(d);
          return (
            <button
              key={d.id}
              className={`minimap-dot${seen ? " visited" : ""}`}
              style={{ ...pos, background: d.accent, borderColor: d.color }}
              title={d.name}
              onClick={() => fastTravel(tx, tz)}
            />
          );
        })}
        <div ref={playerDotRef} className="minimap-player" title="You" />
      </div>
    </div>
  );
}
