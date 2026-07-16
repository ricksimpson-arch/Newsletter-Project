import { z } from "zod";

import { horizonFactor } from "@/lib/forecast";
import {
  CRITERION_KEYS,
  CRITERION_WEIGHTS,
  clamp,
  computeOverallScore,
  normalizeWeights,
  roundScore,
} from "@/lib/scoring";
import type { CriterionKey, Franchise } from "@/lib/types";

/**
 * Forecast Lab scenario model. The research model is the neutral point:
 * with research weights and all controls at neutral, scenario scores
 * equal the published overall scores exactly, so "Restore research
 * model" reproduces the default ranking.
 */
export interface Scenario {
  name: string;
  /** Percentages; should total 100 (normalize() enforces it). */
  weights: Record<CriterionKey, number>;
  horizonMonths: 6 | 12 | 24;
  /** 1 = research model. 0 removes catalysts, 2 doubles them. */
  releaseCatalystImportance: number;
  /** 1 = research model. */
  transmediaImportance: number;
  /** 0–10; 5 = neutral. Below 5 penalizes hard licensing harder. */
  licensingRiskTolerance: number;
  /** Franchises below this confidence are excluded from results. */
  minConfidence: number;
  /** -1 evergreen … +1 trend; shifts weight between brand and momentum. */
  evergreenVsTrend: number;
  lowMoqPreference: number; // 0–2
  highAovCollectiblesPreference: number; // 0–2
  apparelPreference: number; // 0–2
  familyFriendlyPreference: number; // 0–2
}

export const scenarioSchema: z.ZodType<Scenario> = z.object({
  name: z.string().min(1).max(120),
  weights: z.object({
    brandRecognition: z.number().min(0).max(100),
    momentum: z.number().min(0).max(100),
    fandomEngagement: z.number().min(0).max(100),
    visualSuitability: z.number().min(0).max(100),
    licensingFeasibility: z.number().min(0).max(100),
    demographicFit: z.number().min(0).max(100),
    priceElasticity: z.number().min(0).max(100),
    whitespace: z.number().min(0).max(100),
  }),
  horizonMonths: z.union([z.literal(6), z.literal(12), z.literal(24)]),
  releaseCatalystImportance: z.number().min(0).max(2),
  transmediaImportance: z.number().min(0).max(2),
  licensingRiskTolerance: z.number().min(0).max(10),
  minConfidence: z.number().min(0).max(100),
  evergreenVsTrend: z.number().min(-1).max(1),
  lowMoqPreference: z.number().min(0).max(2),
  highAovCollectiblesPreference: z.number().min(0).max(2),
  apparelPreference: z.number().min(0).max(2),
  familyFriendlyPreference: z.number().min(0).max(2),
});

export const RESEARCH_WEIGHTS_PCT: Record<CriterionKey, number> = Object.fromEntries(
  CRITERION_KEYS.map((key) => [key, Math.round(CRITERION_WEIGHTS[key] * 100)])
) as Record<CriterionKey, number>;

export const RESEARCH_SCENARIO: Scenario = {
  name: "Research model",
  weights: { ...RESEARCH_WEIGHTS_PCT },
  horizonMonths: 12,
  releaseCatalystImportance: 1,
  transmediaImportance: 1,
  licensingRiskTolerance: 5,
  minConfidence: 0,
  evergreenVsTrend: 0,
  lowMoqPreference: 0,
  highAovCollectiblesPreference: 0,
  apparelPreference: 0,
  familyFriendlyPreference: 0,
};

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  scenario: Scenario;
}

function preset(
  id: string,
  label: string,
  description: string,
  overrides: Partial<Scenario>
): ScenarioPreset {
  return {
    id,
    label,
    description,
    scenario: { ...RESEARCH_SCENARIO, ...overrides, name: label },
  };
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  preset(
    "small-company-balanced",
    "Small-company balanced",
    "Evens out demand and feasibility; mild low-MOQ preference.",
    {
      weights: { brandRecognition: 18, momentum: 14, fandomEngagement: 14, visualSuitability: 15, licensingFeasibility: 15, demographicFit: 9, priceElasticity: 6, whitespace: 9 },
      licensingRiskTolerance: 4,
      lowMoqPreference: 1,
    }
  ),
  preset(
    "raw-consumer-demand",
    "Raw consumer demand",
    "Ignores rights friction to show pure fandom potential.",
    {
      weights: { brandRecognition: 28, momentum: 22, fandomEngagement: 20, visualSuitability: 15, licensingFeasibility: 0, demographicFit: 10, priceElasticity: 5, whitespace: 0 },
      licensingRiskTolerance: 8,
    }
  ),
  preset(
    "low-risk-licensing",
    "Low-risk licensing",
    "Heavily rewards easy licensing paths and open whitespace.",
    {
      weights: { brandRecognition: 16, momentum: 12, fandomEngagement: 12, visualSuitability: 14, licensingFeasibility: 25, demographicFit: 8, priceElasticity: 5, whitespace: 8 },
      licensingRiskTolerance: 1,
      lowMoqPreference: 1,
    }
  ),
  preset(
    "apparel-first",
    "Apparel-first",
    "Prioritizes visual suitability and apparel category fit.",
    {
      weights: { brandRecognition: 18, momentum: 16, fandomEngagement: 14, visualSuitability: 20, licensingFeasibility: 12, demographicFit: 8, priceElasticity: 5, whitespace: 7 },
      apparelPreference: 2,
    }
  ),
  preset(
    "collectibles-first",
    "Collectibles-first",
    "Rewards collector behavior and pricing power.",
    {
      weights: { brandRecognition: 18, momentum: 12, fandomEngagement: 18, visualSuitability: 16, licensingFeasibility: 10, demographicFit: 6, priceElasticity: 14, whitespace: 6 },
      highAovCollectiblesPreference: 2,
    }
  ),
  preset(
    "family-gifting",
    "Family gifting",
    "Prioritizes family-safe, giftable, demographically broad IP.",
    {
      weights: { brandRecognition: 15, momentum: 10, fandomEngagement: 12, visualSuitability: 18, licensingFeasibility: 12, demographicFit: 20, priceElasticity: 5, whitespace: 8 },
      familyFriendlyPreference: 2,
      lowMoqPreference: 1,
    }
  ),
  preset(
    "premium-niche",
    "Premium niche",
    "Small, devoted audiences with high willingness to pay.",
    {
      weights: { brandRecognition: 14, momentum: 10, fandomEngagement: 18, visualSuitability: 18, licensingFeasibility: 10, demographicFit: 6, priceElasticity: 14, whitespace: 10 },
      highAovCollectiblesPreference: 1,
    }
  ),
  preset(
    "live-service-momentum",
    "Live-service momentum",
    "Chases current heat and release catalysts.",
    {
      weights: { brandRecognition: 16, momentum: 28, fandomEngagement: 18, visualSuitability: 12, licensingFeasibility: 10, demographicFit: 8, priceElasticity: 4, whitespace: 4 },
      releaseCatalystImportance: 2,
      evergreenVsTrend: 0.6,
    }
  ),
];

const FAMILY_FIT: Record<Franchise["audienceType"], number> = {
  family: 1,
  broad: 0.6,
  "teen-young-adult": 0.35,
  adult: 0.2,
  "collector-niche": 0.15,
};

function averageCategoryOpportunity(franchise: Franchise, categoryIds: string[]): number {
  const values = franchise.productAssessments
    .filter((a) => categoryIds.includes(a.categoryId))
    .map((a) => a.opportunity);
  if (values.length === 0) return 3;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function averageBestCategoryMoqRisk(franchise: Franchise): number {
  const values = franchise.productAssessments
    .filter((a) => franchise.bestCategories.includes(a.categoryId))
    .map((a) => a.moqRisk);
  if (values.length === 0) return 3;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Score a franchise under a scenario. Pure and memoization-friendly. */
export function scenarioScore(franchise: Franchise, scenario: Scenario): number {
  // 1. Weights, with the evergreen↔trend shift applied before normalizing.
  const shifted = { ...scenario.weights };
  const shift = scenario.evergreenVsTrend * 5; // up to ±5 percentage points
  shifted.momentum = Math.max(0, shifted.momentum + shift);
  shifted.brandRecognition = Math.max(0, shifted.brandRecognition - shift);
  const normalized = normalizeWeights(shifted);
  let score = computeOverallScore(franchise.criterionScores, normalized);

  // 2. Catalyst emphasis relative to the research model (neutral = 1).
  const factor = horizonFactor(scenario.horizonMonths);
  score +=
    (scenario.releaseCatalystImportance - 1) *
    franchise.forecastDrivers.releaseCatalystAdjustment *
    factor;
  score +=
    (scenario.transmediaImportance - 1) *
    franchise.forecastDrivers.mediaCatalystAdjustment *
    factor;

  // 3. Licensing-risk tolerance (neutral = 5).
  score -=
    ((5 - scenario.licensingRiskTolerance) / 5) *
    (5 - franchise.criterionScores.licensingFeasibility) *
    0.8;

  // 4. Category and audience preferences (neutral = 0).
  const apparelFit = averageCategoryOpportunity(franchise, ["tshirts", "hoodies", "headwear"]);
  score += scenario.apparelPreference * (apparelFit - 3) * 0.75;

  score +=
    scenario.highAovCollectiblesPreference *
    (franchise.criterionScores.priceElasticity - 7) *
    0.6;

  const moqFit = (5 - averageBestCategoryMoqRisk(franchise)) / 4; // 0–1
  score += scenario.lowMoqPreference * (moqFit - 0.5) * 2;

  score += scenario.familyFriendlyPreference * (FAMILY_FIT[franchise.audienceType] - 0.4) * 3;

  return roundScore(clamp(score, 0, 100), 2);
}

export interface ScenarioRow {
  franchise: Franchise;
  score: number;
  defaultScore: number;
  delta: number;
  rank: number;
  defaultRank: number;
  rankChange: number;
  excluded: boolean;
}

export interface ScenarioResults {
  rows: ScenarioRow[];
  included: ScenarioRow[];
  excluded: ScenarioRow[];
  risers: ScenarioRow[];
  fallers: ScenarioRow[];
  allocation: { label: string; slug: string | null; percent: number }[];
  topCategories: { categoryId: string; weight: number }[];
}

const ALLOCATION_PERCENTS = [25, 20, 15, 15, 10, 5, 5];

export function computeScenarioResults(
  franchises: Franchise[],
  scenario: Scenario
): ScenarioResults {
  const scored = franchises.map((franchise) => ({
    franchise,
    score: scenarioScore(franchise, scenario),
    defaultScore: franchise.overallScore,
    excluded: franchise.confidenceScore < scenario.minConfidence,
  }));

  const included = scored
    .filter((r) => !r.excluded)
    .sort((a, b) => b.score - a.score || a.franchise.rank - b.franchise.rank);
  const excluded = scored.filter((r) => r.excluded);

  const rows: ScenarioRow[] = included.map((r, index) => ({
    ...r,
    delta: roundScore(r.score - r.defaultScore, 1),
    rank: index + 1,
    defaultRank: r.franchise.rank,
    rankChange: r.franchise.rank - (index + 1),
  }));
  const excludedRows: ScenarioRow[] = excluded.map((r) => ({
    ...r,
    delta: roundScore(r.score - r.defaultScore, 1),
    rank: 0,
    defaultRank: r.franchise.rank,
    rankChange: 0,
  }));

  const byMovement = [...rows].sort((a, b) => b.rankChange - a.rankChange);
  const risers = byMovement.filter((r) => r.rankChange > 0).slice(0, 5);
  const fallers = byMovement
    .filter((r) => r.rankChange < 0)
    .slice(-5)
    .sort((a, b) => a.rankChange - b.rankChange);

  const allocation: ScenarioResults["allocation"] = rows
    .slice(0, ALLOCATION_PERCENTS.length)
    .map((row, i) => ({
      label: row.franchise.name,
      slug: row.franchise.slug as string | null,
      percent: ALLOCATION_PERCENTS[i],
    }));
  allocation.push({ label: "Exploratory / benchmark tests", slug: null, percent: 5 });

  const categoryWeights = new Map<string, number>();
  for (const row of rows.slice(0, 10)) {
    row.franchise.bestCategories.forEach((categoryId, index) => {
      const weight = (row.score / 100) * (1 - index * 0.15);
      categoryWeights.set(categoryId, (categoryWeights.get(categoryId) ?? 0) + weight);
    });
  }
  const topCategories = [...categoryWeights.entries()]
    .map(([categoryId, weight]) => ({ categoryId, weight: roundScore(weight, 2) }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 6);

  return { rows: [...rows, ...excludedRows], included: rows, excluded: excludedRows, risers, fallers, allocation, topCategories };
}

export function weightsTotal(weights: Record<CriterionKey, number>): number {
  return roundScore(
    CRITERION_KEYS.reduce((sum, key) => sum + weights[key], 0),
    1
  );
}

/** Scales weights proportionally so they total exactly 100. */
export function normalizeWeightsTo100(
  weights: Record<CriterionKey, number>
): Record<CriterionKey, number> {
  const normalized = normalizeWeights(weights);
  const pct = {} as Record<CriterionKey, number>;
  let running = 0;
  CRITERION_KEYS.forEach((key, index) => {
    if (index === CRITERION_KEYS.length - 1) {
      pct[key] = roundScore(100 - running, 1);
    } else {
      pct[key] = roundScore(normalized[key] * 100, 1);
      running = roundScore(running + pct[key], 1);
    }
  });
  return pct;
}
