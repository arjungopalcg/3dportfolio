import { Link } from "react-router-dom";
import { districtById } from "../data/districts";
import { useStore } from "../store/useStore";
import { Minimap } from "./Minimap";

export function HUD() {
  const muted = useStore((s) => s.settings.muted);
  const toggleMuted = useStore((s) => s.toggleMuted);
  const reducedMotion = useStore((s) => s.settings.reducedMotion);
  const setReducedMotion = useStore((s) => s.setReducedMotion);
  const contact = districtById("contact");

  return (
    <>
      <header className="hud-top">
        <div className="hud-brand">
          <span className="hud-title">Arjun Gopal C G</span>
          <span className="hud-subtitle">an explorable portfolio</span>
        </div>
        <div className="hud-actions">
          {contact?.links?.[0] && (
            <a className="hud-cta" href={contact.links[0].href}>
              {contact.links[0].label}
            </a>
          )}
          <a className="hud-cta secondary" href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <Link className="hud-cta secondary" to="/fallback">
            List view
          </Link>
          <button
            className="hud-icon-btn"
            onClick={toggleMuted}
            aria-pressed={!muted}
            aria-label={muted ? "Unmute ambience" : "Mute ambience"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <button
            className="hud-icon-btn"
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-pressed={reducedMotion}
            aria-label="Toggle reduced motion"
            title="Reduced motion"
          >
            {reducedMotion ? "🧘" : "🏃"}
          </button>
        </div>
      </header>
      <Minimap />
    </>
  );
}
