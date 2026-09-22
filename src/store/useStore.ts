import { create } from "zustand";
import type { Vec2 } from "../data/districts";

export type QualityTier = "high" | "low";

interface Settings {
  reducedMotion: boolean;
  muted: boolean;
  quality: QualityTier;
}

interface AppState {
  settings: Settings;
  setReducedMotion: (v: boolean) => void;
  toggleMuted: () => void;
  setQuality: (q: QualityTier) => void;

  activePanel: string | null;
  openPanel: (id: string) => void;
  closePanel: () => void;

  nearbyDistrict: string | null;
  setNearbyDistrict: (id: string | null) => void;

  visited: Set<string>;
  markVisited: (id: string) => void;

  teleportTarget: Vec2 | null;
  requestTeleport: (pos: Vec2) => void;
  clearTeleport: () => void;

  minimapOpen: boolean;
  toggleMinimap: () => void;

  hintsDismissed: boolean;
  dismissHints: () => void;
}

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export const useStore = create<AppState>((set) => ({
  settings: {
    reducedMotion: prefersReducedMotion,
    muted: true,
    quality: "high",
  },
  setReducedMotion: (v) =>
    set((s) => ({ settings: { ...s.settings, reducedMotion: v } })),
  toggleMuted: () =>
    set((s) => ({ settings: { ...s.settings, muted: !s.settings.muted } })),
  setQuality: (q) => set((s) => ({ settings: { ...s.settings, quality: q } })),

  activePanel: null,
  openPanel: (id) => set({ activePanel: id }),
  closePanel: () => set({ activePanel: null }),

  nearbyDistrict: null,
  setNearbyDistrict: (id) => set({ nearbyDistrict: id }),

  visited: new Set<string>(),
  markVisited: (id) =>
    set((s) => {
      const next = new Set(s.visited);
      next.add(id);
      return { visited: next };
    }),

  teleportTarget: null,
  requestTeleport: (pos) => set({ teleportTarget: pos }),
  clearTeleport: () => set({ teleportTarget: null }),

  minimapOpen: true,
  toggleMinimap: () => set((s) => ({ minimapOpen: !s.minimapOpen })),

  hintsDismissed: false,
  dismissHints: () => set({ hintsDismissed: true }),
}));
