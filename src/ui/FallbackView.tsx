import { Link } from "react-router-dom";
import { DISTRICTS, HUB } from "../data/districts";

export function FallbackView() {
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
        <h2 id="about-heading">{HUB.name}</h2>
        {HUB.bio.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      {DISTRICTS.map((d) => (
        <section key={d.id} id={d.id} aria-labelledby={`${d.id}-heading`} className="fallback-section">
          <p className="panel-eyebrow">{d.represents}</p>
          <h2 id={`${d.id}-heading`} style={{ color: d.color }}>
            {d.name}
          </h2>
          <p className="panel-subtitle">{d.subtitle}</p>
          {d.content.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
          <div className="fallback-links">
            {d.links?.map((link) => (
              <a
                key={link.href + link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
              >
                {link.label}
              </a>
            ))}
            <Link to={`/world/${d.id}`}>Visit in 3D →</Link>
          </div>
        </section>
      ))}
    </div>
  );
}
