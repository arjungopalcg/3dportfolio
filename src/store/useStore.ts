import { create } from "zustand";
import type { Vec2 } from "../data/places";
import type { LightingMode } from "../scene/dayCycle";
import { detectQuality } from "../utils/deviceQuality";
import { setAmbientMuted } from "../audio/ambientAudio";
import { trackEvent } from "../analytics/analytics";

export type QualityTier = "high" | "low";
export type QualityMode = "auto" | QualityTier;

interface Settings {
  reducedMotion: boolean;
  muted: boolean;
  quality: QualityTier;
  qualityMode: QualityMode;
  lightingMode: LightingMode;
}

interface AppState {
  settings: Settings;
  setReducedMotion: (v: boolean) => void;
  toggleMuted: () => void;
  setQualityMode: (mode: QualityMode) => void;
  setLightingMode: (mode: LightingMode) => void;

  activePanel: string | null;
  openPanel: (id: string) => void;
  closePanel: () => void;

  nearbyPlace: string | null;
  setNearbyPlace: (id: string | null) => void;

  visited: Set<string>;
  markVisited: (id: string) => void;

  teleportTarget: Vec2 | null;
  requestTeleport: (pos: Vec2) => void;
  clearTeleport: () => void;

  minimapOpen: boolean;
  toggleMinimap: () => void;

  hintsDismissed: boolean;
  dismissHints: () => void;
  resetHints: () => void;

  settingsOpen: boolean;
  toggleSettings: () => void;
}

const prefersReducedMotion =
  typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

export const useStore = create<AppState>((set) => ({
  settings: {
    reducedMotion: prefersReducedMotion,
    muted: true,
    quality: detectQuality(),
    qualityMode: "auto",
    lightingMode: "auto",
  },
  setReducedMotion: (v) =>
    set((s) => ({ settings: { ...s.settings, reducedMotion: v } })),
  toggleMuted: () =>
    set((s) => {
      const muted = !s.settings.muted;
      setAmbientMuted(muted);
      return { settings: { ...s.settings, muted } };
    }),
  setQualityMode: (mode) =>
    set((s) => ({
      settings: {
        ...s.settings,
        qualityMode: mode,
        quality: mode === "auto" ? detectQuality() : mode,
      },
    })),
  setLightingMode: (mode) =>
    set((s) => ({ settings: { ...s.settings, lightingMode: mode } })),

  activePanel: null,
  openPanel: (id) => {
    trackEvent({ name: "panel_open", placeId: id });
    set({ activePanel: id });
  },
  closePanel: () => set({ activePanel: null }),

  nearbyPlace: null,
  setNearbyPlace: (id) => set({ nearbyPlace: id }),

  visited: new Set<string>(),
  markVisited: (id) =>
    set((s) => {
      if (s.visited.has(id)) return {};
      trackEvent({ name: "place_visited", placeId: id });
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
  resetHints: () => set({ hintsDismissed: false }),

  settingsOpen: false,
  toggleSettings: () => set((s) => ({ settingsOpen: !s.settingsOpen })),
}));
