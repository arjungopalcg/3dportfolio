/**
 * Privacy-respecting analytics scaffold matching the PRD's tracked goals:
 * session duration, districts visited, panel opens, CTA clicks.
 *
 * No third-party script is loaded by default — events go to console in dev
 * so the event shape is visible without a real analytics account. To wire up
 * a real provider, set VITE_PLAUSIBLE_DOMAIN (or swap the sink below for
 * GA4/Fathom/etc.) — no other code in the app needs to change.
 */

export type AnalyticsEvent =
  | { name: "session_start" }
  | { name: "place_visited"; placeId: string }
  | { name: "panel_open"; placeId: string }
  | { name: "cta_click"; target: "cv" | "linkedin" | "email" | "place_link" }
  | { name: "fallback_view_used" }
  | { name: "session_end"; durationSeconds: number };

const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;
let plausibleLoaded = false;

function loadPlausible() {
  if (plausibleLoaded || !PLAUSIBLE_DOMAIN) return;
  plausibleLoaded = true;
  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = PLAUSIBLE_DOMAIN;
  script.src = "https://plausible.io/js/script.js";
  document.head.appendChild(script);
}

interface WindowWithPlausible extends Window {
  plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
}

export function trackEvent(event: AnalyticsEvent) {
  const { name, ...props } = event;

  if (PLAUSIBLE_DOMAIN) {
    loadPlausible();
    const w = window as WindowWithPlausible;
    w.plausible?.(name, { props });
  }

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props);
  }
}

let sessionStart = 0;

export function startSessionTracking() {
  sessionStart = performance.now();
  trackEvent({ name: "session_start" });
  const onUnload = () => {
    trackEvent({
      name: "session_end",
      durationSeconds: Math.round((performance.now() - sessionStart) / 1000),
    });
  };
  window.addEventListener("pagehide", onUnload);
  return () => window.removeEventListener("pagehide", onUnload);
}
