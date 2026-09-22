import { useEffect } from "react";
import { Link } from "react-router-dom";
import { PLACES, CONTACT_LINKS } from "../data/places";
import { setDocumentMeta, resetDocumentMeta } from "../utils/documentMeta";
import { trackEvent } from "../analytics/analytics";

export function FallbackView() {
  useEffect(() => {
    setDocumentMeta("List view", PLACES[0].personalNote);
    trackEvent({ name: "fallback_view_used" });
    return () => resetDocumentMeta();
  }, []);

  return (
    <div className="fallback-view">
      <header className="fallback-header">
        <div>
          <h1>Arjun Gopal C G</h1>
          <p className="fallback-tagline">Product manager · AI-assisted product development</p>
        </div>
        <Link className="hud-cta" to="/">
          Explore the 3D world →
        </Link>
      </header>

      <section aria-labelledby="about-heading">
        <h2 id="about-heading">A road through the places I've lived and worked</h2>
        <p>
          Seven stops, roughly in order: hometown, university, and every place work has taken
          me since — ending up at home right now in Basildon.
        </p>
      </section>

      {PLACES.map((p) => (
        <section key={p.id} id={p.id} aria-labelledby={`${p.id}-heading`} className="fallback-section">
          <p className="panel-eyebrow">{p.tagline}</p>
          <h2 id={`${p.id}-heading`} style={{ color: p.color }}>
            {p.name}
          </h2>
          <p>{p.personalNote}</p>
          {p.roles.map((role) => (
            <div key={role.company + role.title} style={{ marginTop: 14 }}>
              <p className="panel-subtitle">
                {role.title} · {role.company} · {role.period}
              </p>
              <ul>
                {role.bullets.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
          <div className="fallback-links">
            <Link to={`/world/${p.id}`}>Visit in 3D →</Link>
          </div>
        </section>
      ))}

      <section className="fallback-section" aria-labelledby="contact-heading">
        <h2 id="contact-heading">Get in touch</h2>
        <div className="fallback-links">
          <a
            href={CONTACT_LINKS.cv.href}
            onClick={() => trackEvent({ name: "cta_click", target: "cv" })}
          >
            {CONTACT_LINKS.cv.label}
          </a>
          <a
            href={CONTACT_LINKS.email.href}
            onClick={() => trackEvent({ name: "cta_click", target: "email" })}
          >
            {CONTACT_LINKS.email.label}
          </a>
          <a
            href={CONTACT_LINKS.linkedin.href}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent({ name: "cta_click", target: "linkedin" })}
          >
            {CONTACT_LINKS.linkedin.label}
          </a>
        </div>
      </section>
    </div>
  );
}
