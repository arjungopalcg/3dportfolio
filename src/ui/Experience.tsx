import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Scene } from "../scene/Scene";
import { HUD } from "./HUD";
import { ContentPanel } from "./ContentPanel";
import { ControlsHint } from "./ControlsHint";
import { InteractPrompt } from "./InteractPrompt";
import { MobileControls, isTouchDevice } from "./MobileControls";
import { PLACES, approachPoint } from "../data/places";
import { useStore } from "../store/useStore";

export function Experience() {
  const { id } = useParams();
  const openPanel = useStore((s) => s.openPanel);
  const markVisited = useStore((s) => s.markVisited);
  const requestTeleport = useStore((s) => s.requestTeleport);

  useEffect(() => {
    if (!id) return;
    const index = PLACES.findIndex((p) => p.id === id);
    if (index === -1) return;
    requestTeleport(approachPoint(PLACES[index], index));
    openPanel(id);
    markVisited(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="experience">
      <Scene />
      <HUD />
      <InteractPrompt />
      {isTouchDevice() && <MobileControls />}
      <ControlsHint />
      <ContentPanel />
    </div>
  );
}
