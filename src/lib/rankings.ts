import type { Franchise } from "@/lib/types";

/**
 * Pure filter/sort logic for the rankings table. Kept out of the UI so
 * it is unit-testable and shareable (CSV export uses the same results).
 */

export type ScoreBandFilter = "all" | "85+" | "80-84.9" | "75-79.9" | "68-74.9" | "60-67.9" | "<60";
export type LicensingFilter = "all" | "low" | "medium" | "high";
export type MomentumFilter = "all" | "high" | "medium" | "low";
export type TopFilter = "10" | "25" | "all";

export interface RankingsFilter {
  q: string;
  ownership: string; // OwnershipType | "all"
  recommendation: string; // RecommendationLevel | "all"
  band: ScoreBandFilter;
  licensing: LicensingFilter;
  audience: string; // AudienceType | "all"
  category: string; // categoryId | "all"
  momentum: MomentumFilter;
  top: TopFilter;
}

export const DEFAULT_FILTER: RankingsFilter = {
  q: "",
  ownership: "all",
  recommendation: "all",
  band: "all",
  licensing: "all",
  audience: "all",
  category: "all",
  momentum: "all",
  top: "all",
};

function inBand(score: number, band: ScoreBandFilter): boolean {
  switch (band) {
    case "all":
      return true;
    case "85+":
      return score >= 85;
    case "80-84.9":
      return score >= 80 && score < 85;
    case "75-79.9":
      return score >= 75 && score < 80;
    case "68-74.9":
      return score >= 68 && score < 75;
    case "60-67.9":
      return score >= 60 && score < 68;
    case "<60":
      return score < 60;
  }
}

function licensingBucket(complexity: number): Exclude<LicensingFilter, "all"> {
  if (complexity <= 4) return "low";
  if (complexity <= 6) return "medium";
  return "high";
}

function momentumBucket(momentum: number): Exclude<MomentumFilter, "all"> {
  if (momentum >= 7.5) return "high";
  if (momentum >= 5) return "medium";
  return "low";
}

export function filterFranchises(franchises: Franchise[], filter: RankingsFilter): Franchise[] {
  const query = filter.q.trim().toLowerCase();
  let result = franchises.filter((f) => {
    if (query && !f.name.toLowerCase().includes(query)) return false;
    if (filter.ownership !== "all") {
      if (filter.ownership === "sony-family") {
        if (f.ownershipType === "non-sony") return false;
      } else if (f.ownershipType !== filter.ownership) {
        return false;
      }
    }
    if (filter.recommendation !== "all" && f.recommendation !== filter.recommendation) return false;
    if (!inBand(f.overallScore, filter.band)) return false;
    if (filter.licensing !== "all" && licensingBucket(f.licensingComplexity) !== filter.licensing)
      return false;
    if (filter.audience !== "all" && f.audienceType !== filter.audience) return false;
    if (filter.category !== "all" && !f.bestCategories.includes(filter.category)) return false;
    if (filter.momentum !== "all" && momentumBucket(f.criterionScores.momentum) !== filter.momentum)
      return false;
    return true;
  });
  if (filter.top !== "all") {
    const limit = Number(filter.top);
    result = result.filter((f) => f.rank <= limit);
  }
  return result;
}

export type SortKey =
  | "rank"
  | "name"
  | "overallScore"
  | "rawDemandScore"
  | "actionabilityScore"
  | "momentum"
  | "visualSuitability"
  | "licensingFeasibility"
  | "whitespace"
  | "confidenceScore"
  | "lastVerifiedAt";

export type SortDirection = "asc" | "desc";

const ACCESSORS: Record<SortKey, (f: Franchise) => number | string> = {
  rank: (f) => f.rank,
  name: (f) => f.name.toLowerCase(),
  overallScore: (f) => f.overallScore,
  rawDemandScore: (f) => f.rawDemandScore,
  actionabilityScore: (f) => f.actionabilityScore,
  momentum: (f) => f.criterionScores.momentum,
  visualSuitability: (f) => f.criterionScores.visualSuitability,
  licensingFeasibility: (f) => f.criterionScores.licensingFeasibility,
  whitespace: (f) => f.criterionScores.whitespace,
  confidenceScore: (f) => f.confidenceScore,
  lastVerifiedAt: (f) => f.lastVerifiedAt,
};

export function sortFranchises(
  franchises: Franchise[],
  key: SortKey,
  direction: SortDirection
): Franchise[] {
  const accessor = ACCESSORS[key];
  const sign = direction === "asc" ? 1 : -1;
  return [...franchises].sort((a, b) => {
    const va = accessor(a);
    const vb = accessor(b);
    if (va < vb) return -1 * sign;
    if (va > vb) return 1 * sign;
    return a.rank - b.rank; // stable tie-break on default rank
  });
}
