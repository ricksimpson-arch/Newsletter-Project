import { describe, expect, it } from "vitest";

import { benchmarkFranchises, franchiseBySlug, franchises } from "@/data/franchises";
import { sources } from "@/data/sources";
import { computeOverallScore } from "@/lib/scoring";

/**
 * The exact default ranking order: the original seed top-50 (relative
 * order preserved exactly) plus Saros, added at rank 30 in the July 2026
 * research update after its April 30, 2026 release.
 */
const EXPECTED_ORDER: Array<[string, number]> = [
  ["Helldivers 2", 86.0],
  ["God of War", 85.1],
  ["Ghost of Tsushima", 85.0],
  ["Astro Bot", 83.5],
  ["Horizon", 83.2],
  ["The Last of Us", 83.2],
  ["Marvel's Spider-Man", 82.8],
  ["Gran Turismo", 80.8],
  ["Death Stranding", 79.9],
  ["Bloodborne", 78.8],
  ["Ratchet & Clank", 77.6],
  ["Uncharted", 76.8],
  ["LittleBigPlanet / Sackboy", 76.1],
  ["Resident Evil", 75.8],
  ["Final Fantasy VII", 75.5],
  ["MLB The Show", 74.9],
  ["Persona", 74.5],
  ["WipEout", 73.9],
  ["Twisted Metal", 73.2],
  ["Elden Ring", 72.8],
  ["Metal Gear Solid", 72.5],
  ["Monster Hunter", 72.1],
  ["Stellar Blade", 71.7],
  ["Like a Dragon / Yakuza", 71.0],
  ["Kingdom Hearts", 70.3],
  ["Demon's Souls", 69.8],
  ["Silent Hill", 69.5],
  ["Nioh", 68.7],
  ["Days Gone", 68.1],
  ["Saros", 68.0],
  ["Street Fighter", 67.8],
  ["Crash Bandicoot", 67.6],
  ["Tekken", 67.5],
  ["Jak and Daxter", 67.1],
  ["Sly Cooper", 66.4],
  ["Ape Escape", 66.1],
  ["Returnal", 65.8],
  ["inFAMOUS", 65.2],
  ["Spyro", 64.9],
  ["Until Dawn", 64.8],
  ["Journey", 64.4],
  ["PaRappa the Rapper", 64.3],
  ["SOCOM", 63.7],
  ["Patapon", 63.5],
  ["Killzone", 63.0],
  ["Resistance", 62.6],
  ["MotorStorm", 62.2],
  ["MediEvil", 61.9],
  ["Gravity Rush", 61.6],
  ["Shadow of the Colossus / Ico / The Last Guardian", 61.2],
  ["Everybody's Golf", 60.9],
];

describe("seed dataset", () => {
  it("contains exactly 51 franchises (seed 50 + Saros)", () => {
    expect(franchises).toHaveLength(51);
  });

  it("matches the expected ranking order and scores exactly", () => {
    const actual = franchises.map((f) => [f.name, f.overallScore]);
    expect(actual).toEqual(EXPECTED_ORDER);
  });

  it("preserves the original seed top-50 relative order exactly", () => {
    const seedNames = EXPECTED_ORDER.map(([name]) => name).filter((n) => n !== "Saros");
    const actualSeedOrder = franchises.map((f) => f.name).filter((n) => n !== "Saros");
    expect(actualSeedOrder).toEqual(seedNames);
  });

  it("reproduces every overall score from criterion scores within ±0.1", () => {
    for (const franchise of franchises) {
      const computed = computeOverallScore(franchise.criterionScores);
      expect(
        Math.abs(computed - franchise.overallScore),
        `${franchise.name}: computed ${computed}`
      ).toBeLessThanOrEqual(0.1);
    }
  });

  it("ranks by actionability (primary axis) in non-increasing order", () => {
    for (let i = 1; i < franchises.length; i++) {
      expect(franchises[i].actionabilityScore).toBeLessThanOrEqual(
        franchises[i - 1].actionabilityScore
      );
    }
  });

  it("gives Marvel's Spider-Man the highest raw demand despite rank 7", () => {
    const spiderMan = franchiseBySlug.get("marvels-spider-man")!;
    const maxRaw = Math.max(...franchises.map((f) => f.rawDemandScore));
    expect(spiderMan.rawDemandScore).toBe(maxRaw);
    expect(spiderMan.rank).toBe(7);
  });

  it("designates exactly the five benchmark franchises", () => {
    expect(benchmarkFranchises.map((f) => f.slug).sort()).toEqual([
      "elden-ring",
      "final-fantasy-vii",
      "metal-gear-solid",
      "persona",
      "resident-evil",
    ]);
  });

  it("never stores 0 for missing evidence values (null means not reported)", () => {
    for (const franchise of franchises) {
      for (const metric of franchise.evidence) {
        if (metric.value === null) {
          expect(metric.isModeled).toBe(true);
        }
        expect(metric.value).not.toBe(0);
      }
    }
  });

  it("references only registered sources", () => {
    const knownIds = new Set(sources.map((s) => s.id));
    for (const franchise of franchises) {
      for (const id of franchise.sourceIds) {
        expect(knownIds.has(id), `unknown source ${id} on ${franchise.slug}`).toBe(true);
      }
      for (const metric of franchise.evidence) {
        for (const id of metric.sourceIds) {
          expect(knownIds.has(id), `unknown source ${id} on metric ${metric.id}`).toBe(true);
        }
      }
    }
  });

  it("keeps every forecast band around its projected score", () => {
    for (const franchise of franchises) {
      expect(franchise.forecasts).toHaveLength(4);
      for (const point of franchise.forecasts) {
        expect(point.lowCase).toBeLessThanOrEqual(point.projectedScore);
        expect(point.highCase).toBeGreaterThanOrEqual(point.projectedScore);
      }
      const now = franchise.forecasts.find((p) => p.horizonMonths === 0)!;
      expect(now.projectedScore).toBeCloseTo(franchise.overallScore, 5);
      expect(now.lowCase).toBe(now.projectedScore);
    }
  });

  it("ships no bundled imagery (image fields are null until licensed art is added)", () => {
    for (const franchise of franchises) {
      expect(franchise.heroImage ?? null).toBeNull();
      expect(franchise.logoImage ?? null).toBeNull();
    }
  });
});
