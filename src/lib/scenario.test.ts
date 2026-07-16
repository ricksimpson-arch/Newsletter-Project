import { describe, expect, it } from "vitest";

import { franchises } from "@/data/franchises";
import {
  RESEARCH_SCENARIO,
  SCENARIO_PRESETS,
  computeScenarioResults,
  normalizeWeightsTo100,
  scenarioScore,
  scenarioSchema,
  weightsTotal,
} from "@/lib/scenario";
import { CRITERION_KEYS } from "@/lib/scoring";

describe("scenarioScore", () => {
  it("reproduces the published overall score under the research scenario", () => {
    for (const franchise of franchises) {
      expect(
        Math.abs(scenarioScore(franchise, RESEARCH_SCENARIO) - franchise.overallScore),
        franchise.name
      ).toBeLessThanOrEqual(0.15);
    }
  });

  it("keeps the default ranking under the research scenario", () => {
    const results = computeScenarioResults(franchises, RESEARCH_SCENARIO);
    expect(results.included.map((r) => r.franchise.rank)).toEqual(
      franchises.map((f) => f.rank)
    );
  });
});

describe("Family gifting preset", () => {
  const preset = SCENARIO_PRESETS.find((p) => p.id === "family-gifting")!;

  it("raises Astro Bot relative to the default ranking", () => {
    const results = computeScenarioResults(franchises, preset.scenario);
    const astro = results.included.find((r) => r.franchise.slug === "astro-bot")!;
    expect(astro.rank).toBeLessThan(astro.defaultRank);
    expect(astro.rankChange).toBeGreaterThan(0);
  });
});

describe("preset weights", () => {
  it.each(SCENARIO_PRESETS.map((p) => [p.label, p] as const))(
    "%s weights total 100",
    (_label, preset) => {
      expect(weightsTotal(preset.scenario.weights)).toBe(100);
    }
  );

  it("every preset validates against the scenario schema", () => {
    for (const preset of SCENARIO_PRESETS) {
      expect(() => scenarioSchema.parse(preset.scenario)).not.toThrow();
    }
  });
});

describe("weight normalization", () => {
  it("normalizeWeightsTo100 makes arbitrary weights total exactly 100", () => {
    const weights = Object.fromEntries(CRITERION_KEYS.map((k, i) => [k, (i + 1) * 3])) as Record<
      (typeof CRITERION_KEYS)[number],
      number
    >;
    const normalized = normalizeWeightsTo100(weights);
    expect(weightsTotal(normalized)).toBe(100);
  });
});

describe("minimum confidence threshold", () => {
  it("excludes low-confidence franchises from ranked results", () => {
    const scenario = { ...RESEARCH_SCENARIO, minConfidence: 60 };
    const results = computeScenarioResults(franchises, scenario);
    expect(results.excluded.length).toBeGreaterThan(0);
    for (const row of results.excluded) {
      expect(row.franchise.confidenceScore).toBeLessThan(60);
    }
    for (const row of results.included) {
      expect(row.franchise.confidenceScore).toBeGreaterThanOrEqual(60);
    }
  });
});

describe("scenario import validation", () => {
  it("rejects malformed scenario JSON", () => {
    expect(() => scenarioSchema.parse({ name: "bad" })).toThrow();
    expect(() =>
      scenarioSchema.parse({ ...RESEARCH_SCENARIO, horizonMonths: 9 })
    ).toThrow();
  });
});
