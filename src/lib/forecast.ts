import { clamp, roundScore } from "@/lib/scoring";
import type {
  ForecastDrivers,
  ForecastHorizon,
  ForecastPoint,
  ForecastRiskFlags,
} from "@/lib/types";

export const FORECAST_HORIZONS: ForecastHorizon[] = [0, 6, 12, 24];

export const FORECAST_DISCLAIMER =
  "Forecast scores are directional scenarios based on available market indicators, model weights, catalyst assumptions, licensing friction, and merchandise-market evidence. They are not predictions of actual sales or profit.";

/**
 * projectedOpportunity = currentOpportunity
 *   + releaseCatalystAdjustment + mediaCatalystAdjustment
 *   + engagementTrendAdjustment + merchWhitespaceAdjustment
 *   - licensingDelayAdjustment - saturationAdjustment - stalenessAdjustment
 *
 * All adjustments are expressed in overall-score points at the 12-month
 * horizon; other horizons scale them (see horizonFactor).
 */
export function computeProjectedOpportunity(
  currentOpportunity: number,
  drivers: ForecastDrivers
): number {
  return (
    currentOpportunity +
    drivers.releaseCatalystAdjustment +
    drivers.mediaCatalystAdjustment +
    drivers.engagementTrendAdjustment +
    drivers.merchWhitespaceAdjustment -
    drivers.licensingDelayAdjustment -
    drivers.saturationAdjustment -
    drivers.stalenessAdjustment
  );
}

/**
 * How much of the 12-month adjustment applies at each horizon.
 * Catalysts and trends partially land by month 6; by month 24 trend-led
 * gains decay while structural drags (saturation, staleness) compound.
 */
export function horizonFactor(horizon: ForecastHorizon): number {
  switch (horizon) {
    case 0:
      return 0;
    case 6:
      return 0.55;
    case 12:
      return 1;
    case 24:
      return 0.85;
  }
}

/** Structural drags keep compounding after month 12. */
function horizonDragFactor(horizon: ForecastHorizon): number {
  return horizon === 24 ? 1.35 : horizonFactor(horizon);
}

export function scaleDrivers(drivers: ForecastDrivers, horizon: ForecastHorizon): ForecastDrivers {
  const up = horizonFactor(horizon);
  const down = horizonDragFactor(horizon);
  return {
    releaseCatalystAdjustment: drivers.releaseCatalystAdjustment * up,
    mediaCatalystAdjustment: drivers.mediaCatalystAdjustment * up,
    engagementTrendAdjustment: drivers.engagementTrendAdjustment * up,
    merchWhitespaceAdjustment: drivers.merchWhitespaceAdjustment * up,
    licensingDelayAdjustment: drivers.licensingDelayAdjustment * down,
    saturationAdjustment: drivers.saturationAdjustment * down,
    stalenessAdjustment: drivers.stalenessAdjustment * down,
  };
}

export interface BandInputs {
  confidenceScore: number;
  horizon: ForecastHorizon;
  flags: ForecastRiskFlags;
}

/**
 * Half-width of the low/high interval in score points.
 * Wider for low-confidence franchises, unconfirmed releases, multi-party
 * licensing, volatile live-service engagement, and stale disclosures.
 */
export function forecastBandHalfWidth({ confidenceScore, horizon, flags }: BandInputs): number {
  if (horizon === 0) return 0;
  let width = 2.2;
  if (confidenceScore < 60) width += 2.2;
  else if (confidenceScore < 80) width += 1.1;
  if (flags.unconfirmedCatalysts) width += 1.4;
  if (flags.multiPartyLicensing) width += 1.3;
  if (flags.volatileEngagement) width += 1.5;
  if (flags.staleDisclosures) width += 1.0;
  const horizonScale = horizon === 6 ? 0.75 : horizon === 12 ? 1 : 1.35;
  return width * horizonScale;
}

export interface BuildForecastArgs {
  currentOpportunity: number;
  drivers: ForecastDrivers;
  flags: ForecastRiskFlags;
  confidenceScore: number;
  assumptions: Partial<Record<ForecastHorizon, string[]>>;
  catalystIds: string[];
}

/** Deterministically builds the 0/6/12/24-month forecast series. */
export function buildForecastSeries(args: BuildForecastArgs): ForecastPoint[] {
  return FORECAST_HORIZONS.map((horizon) => {
    const scaled = scaleDrivers(args.drivers, horizon);
    const projected = clamp(
      computeProjectedOpportunity(args.currentOpportunity, scaled),
      0,
      100
    );
    const half = forecastBandHalfWidth({
      confidenceScore: args.confidenceScore,
      horizon,
      flags: args.flags,
    });
    return {
      horizonMonths: horizon,
      projectedScore: roundScore(projected),
      lowCase: roundScore(clamp(projected - half, 0, 100)),
      highCase: roundScore(clamp(projected + half, 0, 100)),
      assumptions: args.assumptions[horizon] ?? [],
      catalystIds: horizon === 0 ? [] : args.catalystIds,
    };
  });
}

export type ForecastDirection = "improving" | "steady" | "softening";

/** Direction of travel between now and the 12-month base case. */
export function forecastDirection(points: ForecastPoint[]): ForecastDirection {
  const now = points.find((p) => p.horizonMonths === 0);
  const yearOut = points.find((p) => p.horizonMonths === 12);
  if (!now || !yearOut) return "steady";
  const delta = yearOut.projectedScore - now.projectedScore;
  if (delta >= 1) return "improving";
  if (delta <= -1) return "softening";
  return "steady";
}

export const FORECAST_DIRECTION_LABELS: Record<ForecastDirection, string> = {
  improving: "Improving",
  steady: "Steady",
  softening: "Softening",
};
