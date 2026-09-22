# 3D Interactive Portfolio Map

An explorable 3D world built with React, Three.js (`@react-three/fiber`), and
Zustand. Instead of a scrolling resume, visitors walk a small character down
a road connecting seven real places — hometown, university, and every place
work has taken Arjun since — each one a stop with a name-board signpost and
a memory wall of framed placeholders for photos and notes.

Visual style: bold black ink outlines + flat, high-contrast cel shading (the
"inverted hull" technique — a slightly-inflated black backface shell behind
every mesh), a river and arched footbridge, layered blob-cluster trees, and
a distant jagged mountain silhouette. No hand-painted textures or bespoke 3D
character models — there's no image/3D-asset generation tool available in
this environment, so everything is toon-shaded primitives and procedural
geometry. See "Known gaps" below for exactly where real assets would drop
in.

## Stack

- React 19 + TypeScript + Vite
- `@react-three/fiber` (Three.js) + `@react-three/postprocessing`
- Zustand for app state (active panel, settings, nearby place, teleport requests)
- `react-router-dom` for `/`, `/world/:placeId` deep links, and `/fallback`
- Web Audio API for procedural ambient sound (no audio files)
- Canvas-texture-based 3D text labels (not a shader/SDF text library — more
  broadly compatible with restricted/software-rendered GPUs; see the note in
  `src/scene/Label.tsx`)

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

- `src/data/places.ts` — content model: the 7 road stops (`PLACES`), each
  with a tagline, a personal note, real career `roles` (company/title/
  period/bullets), and `wallItems` (memory-wall placeholder captions), plus
  road-position waypoints and `approachPoint()` for fast-travel/deep-link
  landing spots. `CONTACT_LINKS` holds the CV/email/LinkedIn links. This is
  what a real CMS/CV data source would replace.
- `src/scene/` — the R3F world:
  - `Player` — articulated character (separate head/torso/arms/hands/legs)
    with a procedural walk-cycle animation, camera rig, collision, interaction detection
  - `Place` — the plaza/signpost/memory-wall marker rendered at each stop
  - `Road` / `River` / `Bridge` / `Mountains` — the ribbon-geometry road and
    river (`utils/ribbon.ts`), a static arched footbridge landmark, and a
    distant mountain-silhouette backdrop
  - `Lighting` / `dayCycle.ts` — the animated day → golden hour → dusk cycle
  - `Toon.tsx` / `toonGradient.ts` — shared cel-shading material, the
    `ToonMesh` inverted-hull outline wrapper, and glow markers
  - `Label.tsx` — canvas-texture 3D text (see Stack note above)
  - `PostFX.tsx` — bloom + vignette, gated behind quality tier
  - `AmbientLife` / `Creature.tsx` / `Birds.tsx` — layered-canopy trees,
    grass, leaves, fireflies, birds, forest critters
  - `collidables.ts` / `playerPosition.ts` — small mutable singletons shared
    between the render loop and DOM UI (minimap, camera collision) without
    per-frame React re-renders
- `src/input/inputState.ts` — same pattern for keyboard/touch/mouse input.
- `src/audio/ambientAudio.ts` — procedural pad + filtered-noise wind, built
  from oscillators so no audio assets are needed; started from a real click
  handler to satisfy browser autoplay policy.
- `src/analytics/analytics.ts` — pluggable event sink tracking session
  start/end, place visits, panel opens, and CTA clicks.
- `src/ui/` — DOM overlay: HUD (CTAs, mute, settings), minimap with
  click-to-fast-travel and a live player heading marker, content panels
  (personal note + role history + memory-wall gallery + copy-link action), a
  settings panel (quality/lighting/motion/audio), mobile joystick + interact
  button, the `/fallback` list view.
- `src/utils/deviceQuality.ts` — startup heuristic (cores, memory, UA,
  save-data, DPR) that auto-picks a quality tier; overridable in settings.
- `src/App.tsx` — routes, plus a WebGL2 capability check that redirects
  straight to the 2D fallback on unsupported devices.

## Controls

- **Desktop**: WASD/arrows to walk, click-drag to look, `E` or click the
  prompt to open a place's panel, `Esc` to close it.
- **Mobile**: left-side virtual joystick to walk, drag the right side of the
  screen to look, tap the on-screen prompt to open a panel.
- Minimap markers fast-travel you next to that place. `/world/:id` URLs
  deep-link straight to a place and open its panel; the content panel also
  has a "copy link to this place" action.
- Settings (gear icon): ambient audio, reduced motion, graphics quality
  (auto/high/low), lighting mood (auto-cycle/day/golden hour/dusk).

## Known gaps

- **Art assets**: no hand/AI-painted textures or bespoke rigged 3D models —
  see above. For a real skinned/animated character, the practical path is
  Mixamo (free) — export a GLB and swap it in for `Player.tsx`'s procedural
  mesh via `useGLTF`/`useAnimations`; nothing else in the architecture needs
  to change.
- **Memory wall photos**: `wallItems` in `places.ts` currently hold caption
  placeholders (colored rectangles), not real images — drop photo URLs in
  once available and swap the placeholder `<mesh>` for a textured one in
  `Place.tsx`.
- No CMS-backed content; `places.ts` is the single source of truth.
- Analytics needs a real `VITE_PLAUSIBLE_DOMAIN` (or a swapped-in provider)
  to actually send anywhere; the event instrumentation itself is complete.
- The CV download link and LinkedIn URL in `CONTACT_LINKS` are placeholders —
  swap in the real links before sharing.
- Signpost/wall labels are double-sided but only render correctly-oriented
  text from their designed approach direction; viewed from directly behind,
  text renders mirrored rather than invisible — a minor cosmetic tradeoff,
  not a blank sign.
- No automated test suite; verification here has been manual + Playwright
  smoke checks (console-error-free navigation across all 7 places, settings,
  mobile viewport).
