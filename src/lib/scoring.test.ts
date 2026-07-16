import { describe, expect, it } from "vitest";

import {
  CONFIDENCE_WEIGHTS,
  CRITERION_KEYS,
  CRITERION_WEIGHTS,
  computeConfidenceScore,
  computeOverallScore,
  computeRawDemandScore,
  confidenceBand,
  normalizeWeights,
  recommendationForScore,
} from "@/lib/scoring";
import type { CriterionScores } from "@/lib/types";

/** The published top-10 criterion table from the seed research. */
const TOP10: Array<{ name: string; scores: CriterionScores; expected: number }> = [
  { name: "Helldivers 2", expected: 86.0, scores: { brandRecognition: 7.8, momentum: 9.5, fandomEngagement: 9.5, visualSuitability: 9.2, licensingFeasibility: 7.0, demographicFit: 8.8, priceElasticity: 8.0, whitespace: 8.5 } },
  { name: "God of War", expected: 85.1, scores: { brandRecognition: 9.4, momentum: 8.0, fandomEngagement: 8.8, visualSuitability: 9.0, licensingFeasibility: 8.0, demographicFit: 7.8, priceElasticity: 8.8, whitespace: 6.2 } },
  { name: "Ghost of Tsushima", expected: 85.0, scores: { brandRecognition: 8.4, momentum: 8.3, fandomEngagement: 8.4, visualSuitability: 9.5, licensingFeasibility: 8.5, demographicFit: 8.0, priceElasticity: 8.2, whitespace: 8.0 } },
  { name: "Astro Bot", expected: 83.5, scores: { brandRecognition: 7.2, momentum: 8.0, fandomEngagement: 8.0, visualSuitability: 9.8, licensingFeasibility: 9.0, demographicFit: 9.5, priceElasticity: 7.2, whitespace: 9.2 } },
  { name: "Horizon", expected: 83.2, scores: { brandRecognition: 8.4, momentum: 8.0, fandomEngagement: 8.0, visualSuitability: 9.2, licensingFeasibility: 8.7, demographicFit: 8.0, priceElasticity: 7.8, whitespace: 7.5 } },
  { name: "The Last of Us", expected: 83.2, scores: { brandRecognition: 9.1, momentum: 7.6, fandomEngagement: 9.0, visualSuitability: 8.0, licensingFeasibility: 8.5, demographicFit: 8.2, priceElasticity: 8.2, whitespace: 6.2 } },
  { name: "Marvel's Spider-Man", expected: 82.8, scores: { brandRecognition: 10.0, momentum: 8.6, fandomEngagement: 9.6, visualSuitability: 10.0, licensingFeasibility: 2.2, demographicFit: 9.2, priceElasticity: 9.0, whitespace: 2.8 } },
  { name: "Gran Turismo", expected: 80.8, scores: { brandRecognition: 9.3, momentum: 7.8, fandomEngagement: 7.2, visualSuitability: 7.8, licensingFeasibility: 7.6, demographicFit: 8.2, priceElasticity: 8.5, whitespace: 7.8 } },
  { name: "Death Stranding", expected: 79.9, scores: { brandRecognition: 7.4, momentum: 7.5, fandomEngagement: 8.4, visualSuitability: 9.4, licensingFeasibility: 7.5, demographicFit: 7.0, priceElasticity: 8.8, whitespace: 8.8 } },
  { name: "Bloodborne", expected: 78.8, scores: { brandRecognition: 8.0, momentum: 5.2, fandomEngagement: 9.2, visualSuitability: 9.3, licensingFeasibility: 8.0, demographicFit: 7.4, priceElasticity: 8.4, whitespace: 8.7 } },
];

describe("computeOverallScore", () => {
  it.each(TOP10)("reproduces the seed score for $name within ±0.1", ({ scores, expected }) => {
    expect(Math.abs(computeOverallScore(scores) - expected)).toBeLessThanOrEqual(0.1);
  });

  it("weights sum to 1", () => {
    const total = CRITERION_KEYS.reduce((sum, key) => sum + CRITERION_WEIGHTS[key], 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it("returns 0 for all-zero scores and 100 for all-ten scores", () => {
    const zero = Object.fromEntries(CRITERION_KEYS.map((k) => [k, 0])) as CriterionScores;
    const ten = Object.fromEntries(CRITERION_KEYS.map((k) => [k, 10])) as CriterionScores;
    expect(computeOverallScore(zero)).toBe(0);
    expect(computeOverallScore(ten)).toBeCloseTo(100, 10);
  });
});

describe("computeRawDemandScore", () => {
  it("ranks Marvel's Spider-Man first on raw demand despite its #7 actionability rank", () => {
    const raw = TOP10.map((f) => ({ name: f.name, raw: computeRawDemandScore(f.scores) }));
    const sorted = [...raw].sort((a, b) => b.raw - a.raw);
    expect(sorted[0].name).toBe("Marvel's Spider-Man");
  });
});

describe("recommendationForScore label thresholds", () => {
  it.each([
    [86, "priority"],
    [85, "priority"],
    [84.9, "strong-pursuit"],
    [80, "strong-pursuit"],
    [79.9, "selective-pursuit"],
    [75, "selective-pursuit"],
    [74.9, "test-or-monitor"],
    [68, "test-or-monitor"],
    [67.9, "niche-only"],
    [60, "niche-only"],
    [59.9, "deprioritize"],
    [0, "deprioritize"],
  ] as const)("maps %s to %s", (score, level) => {
    expect(recommendationForScore(score)).toBe(level);
  });
});

describe("normalizeWeights", () => {
  it("normalizes arbitrary weights to sum to 1", () => {
    const weights = Object.fromEntries(CRITERION_KEYS.map((k, i) => [k, i + 1])) as Record<
      (typeof CRITERION_KEYS)[number],
      number
    >;
    const normalized = normalizeWeights(weights);
    const total = CRITERION_KEYS.reduce((sum, key) => sum + normalized[key], 0);
    expect(total).toBeCloseTo(1, 10);
    expect(normalized.momentum / normalized.brandRecognition).toBeCloseTo(2, 10);
  });

  it("falls back to equal weights when all weights are zero", () => {
    const zero = Object.fromEntries(CRITERION_KEYS.map((k) => [k, 0])) as Record<
      (typeof CRITERION_KEYS)[number],
      number
    >;
    const normalized = normalizeWeights(zero);
    expect(normalized.brandRecognition).toBeCloseTo(1 / 8, 10);
  });

  it("clamps negative weights to zero", () => {
    const weights = Object.fromEntries(CRITERION_KEYS.map((k) => [k, 10])) as Record<
      (typeof CRITERION_KEYS)[number],
      number
    >;
    weights.momentum = -5;
    const normalized = normalizeWeights(weights);
    expect(normalized.momentum).toBe(0);
  });
});

describe("computeConfidenceScore", () => {
  it("weights components per the confidence model", () => {
    const components = {
      officialSalesEvidence: 100,
      sourceRecency: 0,
      sourceDiversity: 0,
      engagementEvidence: 0,
      merchEvidence: 0,
      licensingEvidence: 0,
    };
    expect(computeConfidenceScore(components)).toBe(25);
  });

  it("confidence weights sum to 1", () => {
    const total = Object.values(CONFIDENCE_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(1, 10);
  });

  it.each([
    [80, "high"],
    [79.9, "medium"],
    [60, "medium"],
    [59.9, "low"],
  ] as const)("bands %s as %s", (score, band) => {
    expect(confidenceBand(score)).toBe(band);
  });
});
