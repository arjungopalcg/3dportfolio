import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { placeById } from "../data/places";
import { useStore } from "../store/useStore";
import { setDocumentMeta, resetDocumentMeta } from "../utils/documentMeta";
import { trackEvent } from "../analytics/analytics";

export function ContentPanel() {
  const activePanel = useStore((s) => s.activePanel);
  const closePanel = useStore((s) => s.closePanel);
  const navigate = useNavigate();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const place = activePanel ? placeById(activePanel) : null;

  useEffect(() => {
    if (place) {
      closeBtnRef.current?.focus();
      setDocumentMeta(place.name, place.personalNote);
      setCopied(false);
    } else {
      resetDocumentMeta();
    }
  }, [place]);

  useEffect(() => {
    if (!place) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place]);

  if (!place) return null;

  function handleClose() {
    closePanel();
    navigate("/", { replace: true });
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/world/${place!.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent({ name: "cta_click", target: "place_link" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — the URL is still visible/shareable from the address bar via /world/:id
    }
  }

  return (
    <div className="panel-overlay" role="dialog" aria-modal="true" aria-labelledby="panel-title">
      <div className="panel" style={{ borderColor: place.accent }}>
        <button ref={closeBtnRef} className="panel-close" onClick={handleClose} aria-label="Close panel">
          ×
        </button>
        <p className="panel-eyebrow">{place.tagline}</p>
        <h2 id="panel-title" style={{ color: place.color }}>
          {place.name}
        </h2>
        <div className="panel-body">
          <p>{place.personalNote}</p>
        </div>

        {place.roles.length > 0 && (
          <div className="panel-roles">
            {place.roles.map((role) => (
              <div key={role.company + role.title} className="panel-role">
                <div className="panel-role-header">
                  <strong>{role.title}</strong>
                  <span>{role.company}</span>
                  <span className="panel-role-period">{role.period}</span>
                </div>
                <ul>
                  {role.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {place.wallItems.length > 0 && (
          <div className="panel-gallery">
            <p className="panel-gallery-label">Memory wall</p>
            <div className="panel-gallery-grid">
              {place.wallItems.map((item, i) => (
                <div key={i} className="panel-gallery-item" style={{ background: place.color }}>
                  <span>{item.caption}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="panel-links">
          <button className="panel-link secondary" onClick={handleCopyLink}>
            {copied ? "Link copied!" : "Copy link to this place"}
          </button>
        </div>
      </div>
    </div>
  );
}
