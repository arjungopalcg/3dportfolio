import { placeById } from "../data/places";
import { useStore } from "../store/useStore";
import { isTouchDevice } from "./MobileControls";

export function InteractPrompt() {
  const nearbyPlace = useStore((s) => s.nearbyPlace);
  if (!nearbyPlace || isTouchDevice()) return null;
  const place = placeById(nearbyPlace);
  if (!place) return null;

  return (
    <div className="interact-prompt" role="status">
      <kbd>E</kbd> view {place.name}
    </div>
  );
}
