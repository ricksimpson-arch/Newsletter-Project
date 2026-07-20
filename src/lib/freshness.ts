import type { FreshnessStatus } from "@/lib/types";

/**
 * Freshness is evaluated against a reference date (the "research as-of"
 * date) rather than the wall clock, so server and client render the same
 * result and the dataset stays deterministic.
 */
export const RESEARCH_AS_OF = "2026-07-16";

export interface FreshnessThresholds {
  /** Days after which an item should be reviewed. */
  reviewAfterDays: number;
  /** Days after which an item is considered stale. */
  staleAfterDays: number;
}

export const DEFAULT_FRESHNESS_THRESHOLDS: FreshnessThresholds = {
  reviewAfterDays: 180,
  staleAfterDays: 365,
};

export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) return Number.NaN;
  return Math.floor((to - from) / 86_400_000);
}

export function freshnessStatus(
  dateIso: string | undefined,
  referenceIso: string = RESEARCH_AS_OF,
  thresholds: FreshnessThresholds = DEFAULT_FRESHNESS_THRESHOLDS
): FreshnessStatus {
  if (!dateIso) return "unknown";
  const age = daysBetween(dateIso, referenceIso);
  if (Number.isNaN(age)) return "unknown";
  if (age > thresholds.staleAfterDays) return "stale";
  if (age > thresholds.reviewAfterDays) return "review-soon";
  return "current";
}

export const FRESHNESS_LABELS: Record<FreshnessStatus, string> = {
  current: "Current",
  "review-soon": "Review soon",
  stale: "Stale",
  unknown: "Unknown",
};
