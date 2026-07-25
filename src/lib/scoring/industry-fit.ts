import type { AxisCode } from "@/lib/axes";
import type { FullScoreMap, IndustryFitTier } from "./types";

// docs/spec/03-mvp-overview.md section 12: Hospitality / Ownership / Teamwork / Growth /
// Stability / Resilience / Customer Orientation, averaged. The doc calls for weighting by
// job type (接客職 vs 調理職 etc.) but that requires work-history data that doesn't exist
// until Sprint 3, so Sprint 1 uses an equal-weighted average as the documented default.
const INDUSTRY_FIT_AXES: AxisCode[] = ["HOS", "OWN", "TEA", "GRO", "STA", "RES", "CUS"];

export type IndustryFitResult = {
  score: number; // 0-100
  tier: IndustryFitTier;
};

export function computeIndustryFit(normalized: FullScoreMap): IndustryFitResult {
  const sum = INDUSTRY_FIT_AXES.reduce((acc, axis) => acc + normalized[axis], 0);
  const score = Math.round(sum / INDUSTRY_FIT_AXES.length);
  const tier: IndustryFitTier = score >= 70 ? "high" : score >= 40 ? "mid" : "low";
  return { score, tier };
}
