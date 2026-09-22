# 3D Interactive Portfolio Map

An explorable 3D world built with React, Three.js (`@react-three/fiber`), and
Zustand, following the product spec in the project PRD. Instead of a
scrolling resume, visitors walk a small character through a village hub and
eight themed districts, each corresponding to a role, project, or skillset.

This build covers the PRD end-to-end at the code/systems level — hub +
districts, desktop and mobile controls, deep links, an accessible 2D
fallback, toon shading, bloom, a dynamic day/golden-hour/dusk lighting cycle,
ambient life (trees, grass, fireflies, birds, an original forest creature),
procedurally generated ambient audio, auto quality detection, a settings
panel, SEO meta/structured data, and an analytics event scaffold. The one
thing genuinely out of reach in a code-only session is **hand/AI-painted
Ghibli-style textures and bespoke 3D character/prop models** — there's no
image or 3D-asset generation tool wired into this environment, so the art is
toon-shaded primitives in the target warm palette rather than painted
surfaces. Swapping in real GLB assets and textures later is a drop-in
replacement for the geometry in `src/scene/District.tsx` and `Player.tsx`;
nothing else in the architecture needs to change.

## Stack

- React 19 + TypeScript + Vite
- `@react-three/fiber` / `@react-three/drei` (Three.js) + `@react-three/postprocessing`
- Zustand for app state (active panel, settings, nearby district, teleport requests)
- `react-router-dom` for `/`, `/world/:districtId` deep links, and `/fallback`
- Web Audio API for procedural ambient sound (no audio files)

## Running locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build (tsc -b && vite build)
```

To wire up real analytics, set `VITE_PLAUSIBLE_DOMAIN` in a `.env` file —
`src/analytics/analytics.ts` loads Plausible's script and starts sending
events automatically; without it, events just log to the dev console so the
event shape is visible without an account.

## Structure

- `src/data/districts.ts` — content model: every district's (and the hub's)
  name, role, copy, links, world position, and silhouette shape, plus
  `WORLD_POINTS` (hub + districts) used generically by the scene, minimap,
  and interaction system. This is what a real CMS/CV data source would
  replace.
- `src/scene/` — the R3F world:
  - `Player` — character controller, camera rig, collision, interaction detection
  - `District` — per-point-of-interest geometry + collision registration
  - `Lighting` / `dayCycle.ts` — the animated day → golden hour → dusk cycle
  - `Toon.tsx` / `toonGradient.ts` — shared cel-shading material + glow markers
  - `PostFX.tsx` — bloom + vignette, gated behind quality tier
  - `AmbientLife` / `Creature.tsx` / `Birds.tsx` — grass, leaves, fireflies, birds, forest critters
  - `collidables.ts` / `playerPosition.ts` — small mutable singletons shared between the render loop and DOM UI (minimap, camera collision) without per-frame React re-renders
- `src/input/inputState.ts` — same pattern for keyboard/touch/mouse input.
- `src/audio/ambientAudio.ts` — procedural pad + filtered-noise wind, built
  from oscillators so no audio assets are needed; started from a real click
  handler to satisfy browser autoplay policy.
- `src/analytics/analytics.ts` — pluggable event sink tracking session
  start/end, district visits, panel opens, and CTA clicks (the PRD's goals).
- `src/ui/` — DOM overlay: HUD (CTAs, mute, settings), minimap with
  click-to-fast-travel and a live player heading marker, content panels
  (with a copy-link action), a settings panel (quality/lighting/motion/audio),
  mobile joystick + interact button, the `/fallback` list view.
- `src/utils/deviceQuality.ts` — startup heuristic (cores, memory, UA,
  save-data, DPR) that auto-picks a quality tier; overridable in settings.
- `src/App.tsx` — routes, plus a WebGL2 capability check that redirects
  straight to the 2D fallback on unsupported devices.

## Controls

- **Desktop**: WASD/arrows to walk, click-drag to look, `E` or click the
  prompt to open a district's panel, `Esc` to close it.
- **Mobile**: left-side virtual joystick to walk, drag the right side of the
  screen to look, tap the on-screen prompt to open a panel.
- Minimap markers fast-travel you next to that district. `/world/:id` URLs
  deep-link straight to a district and open its panel; the content panel also
  has a "copy link to this room" action.
- Settings (gear icon): ambient audio, reduced motion, graphics quality
  (auto/high/low), lighting mood (auto-cycle/day/golden hour/dusk).

## Known gaps vs. the full PRD

- **Art assets**: no hand/AI-painted textures or bespoke GLB models — see
  above. Everything else in the Phase 2 "feel" list (toon shading, bloom,
  lighting cycle, ambient life, audio) is implemented procedurally.
- No CMS-backed content; `districts.ts` is the single source of truth.
- Analytics needs a real `VITE_PLAUSIBLE_DOMAIN` (or a swapped-in provider)
  to actually send anywhere; the event instrumentation itself is complete.
- The CV download link and LinkedIn URL in `districts.ts` are placeholders —
  swap in the real links before sharing.
- No automated test suite; verification here has been manual + Playwright
  smoke checks (console-error-free navigation, settings, mobile viewport).
