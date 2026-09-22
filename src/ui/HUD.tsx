import { Link } from "react-router-dom";
import { districtById } from "../data/districts";
import { useStore } from "../store/useStore";
import { Minimap } from "./Minimap";
import { SettingsPanel } from "./SettingsPanel";
import { trackEvent } from "../analytics/analytics";

export function HUD() {
  const muted = useStore((s) => s.settings.muted);
  const toggleMuted = useStore((s) => s.toggleMuted);
  const toggleSettings = useStore((s) => s.toggleSettings);
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
            <a
              className="hud-cta"
              href={contact.links[0].href}
              onClick={() => trackEvent({ name: "cta_click", target: "cv" })}
            >
              {contact.links[0].label}
            </a>
          )}
          <a
            className="hud-cta secondary"
            href="https://www.linkedin.com"
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent({ name: "cta_click", target: "linkedin" })}
          >
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
            onClick={toggleSettings}
            aria-label="Open settings"
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </header>
      <Minimap />
      <SettingsPanel />
    </>
  );
}
