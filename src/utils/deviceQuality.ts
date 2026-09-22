import type { QualityTier } from "../store/useStore";

interface NavigatorExtra extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
}

/** A quick heuristic device-capability check to pick a default quality tier. */
export function detectQuality(): QualityTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "high";

  const nav = navigator as NavigatorExtra;
  const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(nav.userAgent);
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData ?? false;
  const dpr = window.devicePixelRatio || 1;

  let score = 0;
  if (isMobileUA) score += 1;
  if (cores <= 4) score += 1;
  if (memory <= 4) score += 1;
  if (saveData) score += 2;
  if (dpr > 2.5) score += 1;

  return score >= 2 ? "low" : "high";
}
