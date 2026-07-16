import { describe, expect, it } from "vitest";

import {
  buildForecastSeries,
  computeProjectedOpportunity,
  forecastBandHalfWidth,
  forecastDirection,
} from "@/lib/forecast";
import type { ForecastDrivers, ForecastRiskFlags } from "@/lib/types";

const NEUTRAL_FLAGS: ForecastRiskFlags = {
  unconfirmedCatalysts: false,
  multiPartyLicensing: false,
  volatileEngagement: false,
  staleDisclosures: false,
};

const DRIVERS: ForecastDrivers = {
  releaseCatalystAdjustment: 1,
  mediaCatalystAdjustment: 0.5,
  engagementTrendAdjustment: 0.5,
  merchWhitespaceAdjustment: 0.5,
  licensingDelayAdjustment: 0.5,
  saturationAdjustment: 0.5,
  stalenessAdjustment: 0.5,
};

describe("computeProjectedOpportunity", () => {
  it("adds catalysts and subtracts drags per the published formula", () => {
    expect(computeProjectedOpportunity(80, DRIVERS)).toBeCloseTo(80 + 2.5 - 1.5, 10);
  });
});

describe("forecastBandHalfWidth", () => {
  const base = { confidenceScore: 85, horizon: 12 as const, flags: NEUTRAL_FLAGS };

  it("is zero at horizon 0 (current score is known)", () => {
    expect(forecastBandHalfWidth({ ...base, horizon: 0 as never })).toBe(0);
  });

  it("widens for low confidence", () => {
    const high = forecastBandHalfWidth(base);
    const medium = forecastBandHalfWidth({ ...base, confidenceScore: 70 });
    const low = forecastBandHalfWidth({ ...base, confidenceScore: 50 });
    expect(medium).toBeGreaterThan(high);
    expect(low).toBeGreaterThan(medium);
  });

  it.each([
    ["unconfirmedCatalysts"],
    ["multiPartyLicensing"],
    ["volatileEngagement"],
    ["staleDisclosures"],
  ] as const)("widens for %s", (flag) => {
    const flagged = forecastBandHalfWidth({
      ...base,
      flags: { ...NEUTRAL_FLAGS, [flag]: true },
    });
    expect(flagged).toBeGreaterThan(forecastBandHalfWidth(base));
  });

  it("widens with horizon", () => {
    const six = forecastBandHalfWidth({ ...base, horizon: 6 });
    const twelve = forecastBandHalfWidth({ ...base, horizon: 12 });
    const twentyFour = forecastBandHalfWidth({ ...base, horizon: 24 });
    expect(twelve).toBeGreaterThan(six);
    expect(twentyFour).toBeGreaterThan(twelve);
  });
});

describe("buildForecastSeries", () => {
  const series = buildForecastSeries({
    currentOpportunity: 80,
    drivers: DRIVERS,
    flags: NEUTRAL_FLAGS,
    confidenceScore: 85,
    assumptions: { 12: ["test assumption"] },
    catalystIds: ["q4-gifting"],
  });

  it("produces the four standard horizons", () => {
    expect(series.map((p) => p.horizonMonths)).toEqual([0, 6, 12, 24]);
  });

  it("anchors horizon 0 at the current score with a zero-width band", () => {
    expect(series[0].projectedScore).toBe(80);
    expect(series[0].lowCase).toBe(80);
    expect(series[0].highCase).toBe(80);
  });

  it("contains the projected score inside every band", () => {
    for (const point of series) {
      expect(point.lowCase).toBeLessThanOrEqual(point.projectedScore);
      expect(point.highCase).toBeGreaterThanOrEqual(point.projectedScore);
    }
  });
});

describe("forecastDirection", () => {
  it("classifies improving/steady/softening from the 12-month delta", () => {
    const make = (delta: number) => [
      { horizonMonths: 0 as const, projectedScore: 80, lowCase: 80, highCase: 80, assumptions: [], catalystIds: [] },
      { horizonMonths: 12 as const, projectedScore: 80 + delta, lowCase: 70, highCase: 95, assumptions: [], catalystIds: [] },
    ];
    expect(forecastDirection(make(2))).toBe("improving");
    expect(forecastDirection(make(0.5))).toBe("steady");
    expect(forecastDirection(make(-2))).toBe("softening");
  });
});
