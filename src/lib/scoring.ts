import type {
  ConfidenceComponents,
  CriterionKey,
  CriterionScores,
  RecommendationLevel,
} from "@/lib/types";

/**
 * Research-model criterion weights. Each criterion is scored 0–10;
 * the weighted sum is multiplied by 10 to give a 0–100 overall score.
 */
export const CRITERION_WEIGHTS: Record<CriterionKey, number> = {
  brandRecognition: 0.22,
  momentum: 0.18,
  fandomEngagement: 0.15,
  visualSuitability: 0.15,
  licensingFeasibility: 0.12,
  demographicFit: 0.08,
  priceElasticity: 0.05,
  whitespace: 0.05,
};

export const CRITERION_KEYS = Object.keys(CRITERION_WEIGHTS) as CriterionKey[];

export const CRITERION_LABELS: Record<CriterionKey, string> = {
  brandRecognition: "Brand recognition",
  momentum: "Momentum",
  fandomEngagement: "Fandom engagement",
  visualSuitability: "Visual suitability",
  licensingFeasibility: "Licensing feasibility",
  demographicFit: "Demographic fit",
  priceElasticity: "Pricing power",
  whitespace: "Competition / whitespace",
};

export const CRITERION_DESCRIPTIONS: Record<CriterionKey, string> = {
  brandRecognition: "How widely the IP is known beyond its core player base.",
  momentum: "Current cultural and engagement heat: releases, players, conversation.",
  fandomEngagement: "Depth of fan identity — community, cosplay, collecting behavior.",
  visualSuitability: "How well symbols, palettes, and iconography translate to products.",
  licensingFeasibility: "How practical a license is for a small company (10 = easiest).",
  demographicFit: "Overlap with demographics that buy physical merchandise.",
  priceElasticity: "Willingness of fans to pay premium prices.",
  whitespace: "How under-served the merch market is (10 = wide open).",
};

/**
 * Raw-demand weights: consumer/fandom potential largely ignoring rights
 * friction. Licensing feasibility and whitespace are excluded and the
 * remaining weights are renormalized (modeled, documented in methodology).
 */
export const RAW_DEMAND_WEIGHTS: Partial<Record<CriterionKey, number>> = {
  brandRecognition: 0.28,
  momentum: 0.22,
  fandomEngagement: 0.2,
  visualSuitability: 0.15,
  demographicFit: 0.1,
  priceElasticity: 0.05,
};

/** Weighted 8-criterion score on the 0–100 scale. */
export function computeOverallScore(
  scores: CriterionScores,
  weights: Record<CriterionKey, number> = CRITERION_WEIGHTS
): number {
  let total = 0;
  for (const key of CRITERION_KEYS) {
    total += scores[key] * (weights[key] ?? 0);
  }
  return total * 10;
}

/** Consumer-demand-only score on the 0–100 scale (modeled view). */
export function computeRawDemandScore(scores: CriterionScores): number {
  let total = 0;
  for (const [key, weight] of Object.entries(RAW_DEMAND_WEIGHTS)) {
    total += scores[key as CriterionKey] * weight;
  }
  return total * 10;
}

export interface RecommendationBand {
  level: RecommendationLevel;
  label: string;
  min: number;
  description: string;
}

export const RECOMMENDATION_BANDS: RecommendationBand[] = [
  {
    level: "priority",
    label: "Priority",
    min: 85,
    description: "Strongest actionable opportunities; pursue first.",
  },
  {
    level: "strong-pursuit",
    label: "Strong Pursuit",
    min: 80,
    description: "High-conviction opportunities worth active pursuit.",
  },
  {
    level: "selective-pursuit",
    label: "Selective Pursuit",
    min: 75,
    description: "Pursue with a focused category or audience angle.",
  },
  {
    level: "test-or-monitor",
    label: "Test or Monitor",
    min: 68,
    description: "Small tests or watchlist; not a lead opportunity today.",
  },
  {
    level: "niche-only",
    label: "Niche Only",
    min: 60,
    description: "Viable only as a narrow, low-volume niche play.",
  },
  {
    level: "deprioritize",
    label: "Deprioritize",
    min: 0,
    description: "Not commercially compelling under the current model.",
  },
];

export function recommendationForScore(score: number): RecommendationLevel {
  for (const band of RECOMMENDATION_BANDS) {
    if (score >= band.min) return band.level;
  }
  return "deprioritize";
}

export function recommendationLabel(level: RecommendationLevel): string {
  return RECOMMENDATION_BANDS.find((b) => b.level === level)?.label ?? level;
}

/** Confidence-model weights (0–100 output). */
export const CONFIDENCE_WEIGHTS: Record<keyof ConfidenceComponents, number> = {
  officialSalesEvidence: 0.25,
  sourceRecency: 0.2,
  sourceDiversity: 0.15,
  engagementEvidence: 0.15,
  merchEvidence: 0.15,
  licensingEvidence: 0.1,
};

export function computeConfidenceScore(components: ConfidenceComponents): number {
  let total = 0;
  for (const [key, weight] of Object.entries(CONFIDENCE_WEIGHTS)) {
    total += components[key as keyof ConfidenceComponents] * weight;
  }
  return total;
}

export type ConfidenceBand = "high" | "medium" | "low";

export function confidenceBand(score: number): ConfidenceBand {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export const CONFIDENCE_BAND_LABELS: Record<ConfidenceBand, string> = {
  high: "High confidence",
  medium: "Medium confidence",
  low: "Low confidence",
};

/**
 * Normalizes a weight map so values sum to 1 (formula scale).
 * If every weight is zero, returns equal weights.
 */
export function normalizeWeights(
  weights: Record<CriterionKey, number>
): Record<CriterionKey, number> {
  const sum = CRITERION_KEYS.reduce((acc, key) => acc + Math.max(0, weights[key]), 0);
  const result = {} as Record<CriterionKey, number>;
  if (sum <= 0) {
    for (const key of CRITERION_KEYS) result[key] = 1 / CRITERION_KEYS.length;
    return result;
  }
  for (const key of CRITERION_KEYS) {
    result[key] = Math.max(0, weights[key]) / sum;
  }
  return result;
}

export function roundScore(value: number, decimals = 1): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
