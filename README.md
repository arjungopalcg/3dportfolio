# 3D Interactive Portfolio Map

An explorable 3D world built with React, Three.js (`@react-three/fiber`), and
Zustand, following the product spec in the project PRD. Instead of a
scrolling resume, visitors walk a small character through a village hub and
eight themed districts, each corresponding to a role, project, or skillset.

This build covers **PRD Phase 0/1 (prototype → MVP)**: the full hub +
district layout is navigable end-to-end with real content, desktop and
mobile controls, deep links, and an accessible 2D fallback. Geometry is
placeholder low-poly/primitive art in a warm palette — the Ghibli-grade
painterly art pass (textures, day/night lighting cycle, bloom/post-processing,
ambient audio) is explicitly **Phase 2** per the PRD and not included here.

## Stack

- React 19 + TypeScript + Vite
- `@react-three/fiber` / `@react-three/drei` (Three.js)
- Zustand for app state (active panel, settings, nearby district, teleport requests)
- `react-router-dom` for `/`, `/world/:districtId` deep links, and `/fallback`

## Running locally

```bash
npm install
npm run dev      # dev server
npm run build    # production build (tsc -b && vite build)
```

## Structure

- `src/data/districts.ts` — content model: every district's name, role,
  copy, links, world position, and silhouette shape (this is what a real
  CMS/CV data source would replace).
- `src/scene/` — the R3F world: `Player` (character controller + camera),
  `District` (per-district placeholder geometry + collision registration),
  `Lighting`, `AmbientLife` (instanced trees + fireflies), `World`, `Scene`.
- `src/input/inputState.ts` — a small mutable singleton shared between DOM
  touch/mouse listeners and the R3F render loop (avoids per-frame React
  re-renders for input).
- `src/ui/` — DOM overlay: HUD (CTAs, mute, reduced-motion), minimap with
  click-to-fast-travel and a live player heading marker, content panels,
  mobile joystick + interact button, the `/fallback` list view.
- `src/App.tsx` — routes, plus a WebGL2 capability check that redirects
  straight to the 2D fallback on unsupported devices.

## Controls

- **Desktop**: WASD/arrows to walk, click-drag to look, `E` or click the
  prompt to open a district's panel, `Esc` to close it.
- **Mobile**: left-side virtual joystick to walk, drag the right side of the
  screen to look, tap the on-screen prompt to open a panel.
- Minimap markers fast-travel you next to that district. `/world/:id` URLs
  deep-link straight to a district and open its panel.

## Known gaps vs. the full PRD

- Art pass (Phase 2): hand/AI-painted textures, cel-shading, bloom, day-to-
  golden-hour lighting cycle, ambient score are not implemented — current
  visuals are flat-shaded primitives in the target palette.
- No CMS-backed content; `districts.ts` is the single source of truth.
- Audio mute toggle exists in the HUD but no ambient track is wired up yet.
- Analytics (Plausible/GA4) and a real CV asset are not wired up.
