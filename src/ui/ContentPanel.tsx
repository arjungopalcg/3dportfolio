import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { districtById } from "../data/districts";
import { useStore } from "../store/useStore";

export function ContentPanel() {
  const activePanel = useStore((s) => s.activePanel);
  const closePanel = useStore((s) => s.closePanel);
  const navigate = useNavigate();
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const district = activePanel ? districtById(activePanel) : null;

  useEffect(() => {
    if (district) closeBtnRef.current?.focus();
  }, [district]);

  useEffect(() => {
    if (!district) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [district]);

  if (!district) return null;

  function handleClose() {
    closePanel();
    navigate("/", { replace: true });
  }

  return (
    <div className="panel-overlay" role="dialog" aria-modal="true" aria-labelledby="panel-title">
      <div className="panel" style={{ borderColor: district.accent }}>
        <button ref={closeBtnRef} className="panel-close" onClick={handleClose} aria-label="Close panel">
          ×
        </button>
        <p className="panel-eyebrow">{district.represents}</p>
        <h2 id="panel-title" style={{ color: district.color }}>
          {district.name}
        </h2>
        <p className="panel-subtitle">{district.subtitle}</p>
        <div className="panel-body">
          {district.content.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        {district.links && district.links.length > 0 && (
          <div className="panel-links">
            {district.links.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="panel-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
