import { districtById } from "../data/districts";
import { useStore } from "../store/useStore";
import { isTouchDevice } from "./MobileControls";

export function InteractPrompt() {
  const nearbyDistrict = useStore((s) => s.nearbyDistrict);
  if (!nearbyDistrict || isTouchDevice()) return null;
  const district = districtById(nearbyDistrict);
  if (!district) return null;

  return (
    <div className="interact-prompt" role="status">
      <kbd>E</kbd> view {district.name}
    </div>
  );
}
