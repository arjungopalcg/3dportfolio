import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import { isTouchDevice } from "./MobileControls";

export function ControlsHint() {
  const hintsDismissed = useStore((s) => s.hintsDismissed);
  const dismissHints = useStore((s) => s.dismissHints);
  const [visible, setVisible] = useState(!hintsDismissed);
  const touch = isTouchDevice();

  useEffect(() => {
    if (hintsDismissed) return;
    const dismiss = () => {
      setVisible(false);
      dismissHints();
    };
    const timer = setTimeout(dismiss, 9000);
    window.addEventListener("keydown", dismiss, { once: true });
    window.addEventListener("touchstart", dismiss, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("touchstart", dismiss);
    };
  }, [hintsDismissed, dismissHints]);

  if (!visible) {
    return (
      <button
        className="help-toggle"
        onClick={() => setVisible(true)}
        aria-label="Show controls"
      >
        ?
      </button>
    );
  }

  return (
    <div className="controls-hint" role="status">
      {touch ? (
        <p>Left joystick to walk · Drag right side to look · Tap prompts to explore</p>
      ) : (
        <p>WASD to walk · Click + drag to look · E to interact</p>
      )}
    </div>
  );
}
