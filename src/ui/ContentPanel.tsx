import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { districtById } from "../data/districts";
import { useStore } from "../store/useStore";
import { setDocumentMeta, resetDocumentMeta } from "../utils/documentMeta";
import { trackEvent } from "../analytics/analytics";

export function ContentPanel() {
  const activePanel = useStore((s) => s.activePanel);
  const closePanel = useStore((s) => s.closePanel);
  const navigate = useNavigate();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const district = activePanel ? districtById(activePanel) : null;

  useEffect(() => {
    if (district) {
      closeBtnRef.current?.focus();
      setDocumentMeta(district.name, district.content[0]);
      setCopied(false);
    } else {
      resetDocumentMeta();
    }
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

  async function handleCopyLink() {
    const url = `${window.location.origin}/world/${district!.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent({ name: "cta_click", target: "district_link" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — the URL is still visible/shareable from the address bar via /world/:id
    }
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
        <div className="panel-links">
          {district.links?.map((link) => (
            <a
              key={link.href + link.label}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="panel-link"
              onClick={() => trackEvent({ name: "cta_click", target: ctaTarget(link.href) })}
            >
              {link.label}
            </a>
          ))}
          {district.id !== "hub" && (
            <button className="panel-link secondary" onClick={handleCopyLink}>
              {copied ? "Link copied!" : "Copy link to this room"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ctaTarget(href: string): "cv" | "linkedin" | "email" {
  if (href.startsWith("mailto:")) return "email";
  if (href.includes("linkedin")) return "linkedin";
  return "cv";
}
