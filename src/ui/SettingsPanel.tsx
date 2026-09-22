import { useEffect, useRef } from "react";
import { useStore } from "../store/useStore";
import type { QualityMode } from "../store/useStore";
import type { LightingMode } from "../scene/dayCycle";

const QUALITY_OPTIONS: { value: QualityMode; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "high", label: "High" },
  { value: "low", label: "Low" },
];

const LIGHTING_OPTIONS: { value: LightingMode; label: string }[] = [
  { value: "auto", label: "Cycle" },
  { value: "day", label: "Day" },
  { value: "golden", label: "Golden hour" },
  { value: "dusk", label: "Dusk" },
];

export function SettingsPanel() {
  const settingsOpen = useStore((s) => s.settingsOpen);
  const toggleSettings = useStore((s) => s.toggleSettings);
  const settings = useStore((s) => s.settings);
  const setReducedMotion = useStore((s) => s.setReducedMotion);
  const toggleMuted = useStore((s) => s.toggleMuted);
  const setQualityMode = useStore((s) => s.setQualityMode);
  const setLightingMode = useStore((s) => s.setLightingMode);
  const resetHints = useStore((s) => s.resetHints);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (settingsOpen) closeBtnRef.current?.focus();
  }, [settingsOpen]);

  useEffect(() => {
    if (!settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleSettings();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [settingsOpen, toggleSettings]);

  if (!settingsOpen) return null;

  return (
    <div className="panel-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="panel settings-panel">
        <button ref={closeBtnRef} className="panel-close" onClick={toggleSettings} aria-label="Close settings">
          ×
        </button>
        <h2 id="settings-title">Settings</h2>

        <div className="settings-row">
          <span>Ambient audio</span>
          <button className="pill-toggle" onClick={toggleMuted} aria-pressed={!settings.muted}>
            {settings.muted ? "Muted" : "On"}
          </button>
        </div>

        <div className="settings-row">
          <span>Reduced motion</span>
          <button
            className="pill-toggle"
            onClick={() => setReducedMotion(!settings.reducedMotion)}
            aria-pressed={settings.reducedMotion}
          >
            {settings.reducedMotion ? "On" : "Off"}
          </button>
        </div>

        <div className="settings-row column">
          <span>Graphics quality</span>
          <div className="pill-group">
            {QUALITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`pill-option${settings.qualityMode === opt.value ? " active" : ""}`}
                onClick={() => setQualityMode(opt.value)}
                aria-pressed={settings.qualityMode === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="settings-row column">
          <span>Lighting mood</span>
          <div className="pill-group">
            {LIGHTING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`pill-option${settings.lightingMode === opt.value ? " active" : ""}`}
                onClick={() => setLightingMode(opt.value)}
                aria-pressed={settings.lightingMode === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="settings-hint-btn"
          onClick={() => {
            resetHints();
            toggleSettings();
          }}
        >
          Show controls again
        </button>
      </div>
    </div>
  );
}
