import { useEffect, useRef } from "react";
import { PLACES, approachPoint } from "../data/places";
import { useStore } from "../store/useStore";
import { playerWorld } from "../scene/playerPosition";

const MAP_SIZE = 168;
const BOUNDS = { xMin: -14, xMax: 58, zMin: -27, zMax: 42 };
const PADDING = 10;

function worldToMap(x: number, z: number) {
  const spanX = BOUNDS.xMax - BOUNDS.xMin + PADDING * 2;
  const spanZ = BOUNDS.zMax - BOUNDS.zMin + PADDING * 2;
  const scale = MAP_SIZE / Math.max(spanX, spanZ);
  return {
    left: (x - BOUNDS.xMin + PADDING) * scale,
    top: (z - BOUNDS.zMin + PADDING) * scale,
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
        {PLACES.map((p, i) => {
          const pos = worldToMap(p.position[0], p.position[1]);
          const seen = visited.has(p.id);
          const [tx, tz] = approachPoint(p, i);
          return (
            <button
              key={p.id}
              className={`minimap-dot${seen ? " visited" : ""}`}
              style={{ ...pos, background: p.accent, borderColor: p.color }}
              title={p.name}
              onClick={() => fastTravel(tx, tz)}
            />
          );
        })}
        <div ref={playerDotRef} className="minimap-player" title="You" />
      </div>
    </div>
  );
}
