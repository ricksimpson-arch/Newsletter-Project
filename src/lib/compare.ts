import { categoryName } from "@/data/productCategories";
import { forecastDirection } from "@/lib/forecast";
import type { Franchise } from "@/lib/types";

/**
 * Deterministic plain-language comparison summary, generated from
 * structured data and templates only — no AI API involved.
 */

const ANGLE_BY_AUDIENCE: Record<Franchise["audienceType"], string> = {
  family: "family gifting and plush expansion",
  broad: "broad-reach evergreen product",
  "teen-young-adult": "youth-driven apparel and streetwear",
  adult: "premium adult-fan product",
  "collector-niche": "collector-led premium drops",
};

function strongestCriterionAngle(franchise: Franchise): string {
  const c = franchise.criterionScores;
  const entries: [string, number][] = [
    ["design-led premium apparel", c.visualSuitability],
    ["demand-led mainstream product", c.brandRecognition],
    ["community-driven drops", c.fandomEngagement],
    ["momentum-timed capsules", c.momentum],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

export function generateComparisonSummary(selection: Franchise[]): string[] {
  if (selection.length < 2) return [];
  const sorted = [...selection].sort((a, b) => b.actionabilityScore - a.actionabilityScore);
  const leader = sorted[0];
  const runnerUp = sorted[1];
  const paragraphs: string[] = [];

  paragraphs.push(
    `${leader.name} is the strongest ${strongestCriterionAngle(leader)} opportunity in this set (score ${leader.actionabilityScore.toFixed(1)}, ${ANGLE_BY_AUDIENCE[leader.audienceType]}), while ${runnerUp.name} offers the best ${ANGLE_BY_AUDIENCE[runnerUp.audienceType]} at ${runnerUp.actionabilityScore.toFixed(1)}.`
  );

  const easiest = [...selection].sort((a, b) => a.licensingComplexity - b.licensingComplexity)[0];
  const hardest = [...selection].sort((a, b) => b.licensingComplexity - a.licensingComplexity)[0];
  if (easiest.slug !== hardest.slug) {
    paragraphs.push(
      `${easiest.name} has the most practical licensing path (complexity ${easiest.licensingComplexity}/10); ${hardest.name} carries the heaviest rights burden (${hardest.licensingComplexity}/10) — ${hardest.mainRisk}`
    );
  }

  const improving = selection.filter((f) => forecastDirection(f.forecasts) === "improving");
  if (improving.length > 0) {
    paragraphs.push(
      `Forecast direction favors ${improving.map((f) => f.name).join(" and ")} over the next 12 months under base-case assumptions.`
    );
  }

  const categories = selection
    .map((f) => `${f.name} leads with ${f.bestCategories.slice(0, 2).map(categoryName).join(" and ").toLowerCase()}`)
    .join("; ");
  paragraphs.push(`Category strengths differ: ${categories}.`);

  const lowConfidence = selection.filter((f) => f.confidenceScore < 60);
  if (lowConfidence.length > 0) {
    paragraphs.push(
      `Treat ${lowConfidence.map((f) => f.name).join(" and ")} with caution: confidence is Low, so evidence is thinner than the scores imply.`
    );
  }

  return paragraphs;
}
