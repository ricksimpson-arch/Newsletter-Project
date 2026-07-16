import type { Metadata } from "next";

import { RecommendationBadge, SourceTierBadge } from "@/components/indicators";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FORMULA_TEXT, methodologySections } from "@/data/methodology";
import {
  CONFIDENCE_WEIGHTS,
  CRITERION_DESCRIPTIONS,
  CRITERION_KEYS,
  CRITERION_LABELS,
  CRITERION_WEIGHTS,
  RECOMMENDATION_BANDS,
} from "@/lib/scoring";
import { DEFAULT_FRESHNESS_THRESHOLDS } from "@/lib/freshness";
import type { SourceTier } from "@/lib/types";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "The weighted scoring model, confidence model, forecast model, and source-tier hierarchy behind LootSignal's rankings.",
};

const TIERS: Array<{ tier: SourceTier; description: string }> = [
  { tier: "tier-1", description: "Publisher, developer, investor-relations, or official platform data." },
  { tier: "tier-2", description: "Established industry databases and analytics services (e.g. SteamDB)." },
  { tier: "tier-3", description: "Community, streaming, retail, and search proxies (e.g. specialty retail listings)." },
  { tier: "modeled", description: "Internal calculation — always visually flagged, never presented as reported fact." },
];

const CONFIDENCE_LABELS: Record<string, string> = {
  officialSalesEvidence: "Official sales evidence",
  sourceRecency: "Source recency",
  sourceDiversity: "Source diversity",
  engagementEvidence: "Engagement evidence",
  merchEvidence: "Merchandise-market evidence",
  licensingEvidence: "Licensing evidence",
};

export default function MethodologyPage() {
  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Written for an executive to understand and an analyst to audit. Every formula shown here
          is the same code that computes the numbers on screen, and unit tests verify it reproduces
          the published seed scores.
        </p>
      </header>

      {methodologySections.map((section) => (
        <section key={section.id} aria-labelledby={section.id} className="max-w-3xl space-y-3">
          <h2 id={section.id} className="text-lg font-semibold">
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-sm leading-relaxed text-muted-foreground">
              {paragraph}
            </p>
          ))}

          {section.id === "weighted-model" && (
            <>
              <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed">
                {FORMULA_TEXT.overallScore}
              </pre>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Criterion</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                      <TableHead>What it measures</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CRITERION_KEYS.map((key) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{CRITERION_LABELS[key]}</TableCell>
                        <TableCell className="text-right tnum">
                          {Math.round(CRITERION_WEIGHTS[key] * 100)}%
                        </TableCell>
                        <TableCell className="max-w-md whitespace-normal text-xs text-muted-foreground">
                          {CRITERION_DESCRIPTIONS[key]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {section.id === "two-outputs" && (
            <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed">
              {FORMULA_TEXT.rawDemand}
            </pre>
          )}

          {section.id === "score-labels" && (
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Range</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Meaning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RECOMMENDATION_BANDS.map((band, index) => {
                    const upper = index === 0 ? 100 : RECOMMENDATION_BANDS[index - 1].min;
                    return (
                      <TableRow key={band.level}>
                        <TableCell className="tnum">
                          {index === 0 ? `${band.min}–100` : `${band.min}–${(upper - 0.1).toFixed(1)}`}
                        </TableCell>
                        <TableCell>
                          <RecommendationBadge level={band.level} />
                        </TableCell>
                        <TableCell className="max-w-md whitespace-normal text-xs text-muted-foreground">
                          {band.description}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {section.id === "confidence-model" && (
            <>
              <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed">
                {FORMULA_TEXT.confidence}
              </pre>
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Component</TableHead>
                      <TableHead className="text-right">Weight</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(CONFIDENCE_WEIGHTS).map(([key, weight]) => (
                      <TableRow key={key}>
                        <TableCell>{CONFIDENCE_LABELS[key]}</TableCell>
                        <TableCell className="text-right tnum">{Math.round(weight * 100)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {section.id === "forecast-model" && (
            <pre className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed">
              {FORMULA_TEXT.forecast}
            </pre>
          )}

          {section.id === "source-tiers" && (
            <ul className="space-y-2">
              {TIERS.map(({ tier, description }) => (
                <li key={tier} className="flex items-start gap-3 text-sm">
                  <SourceTierBadge tier={tier} className="mt-0.5" />
                  <span className="text-muted-foreground">{description}</span>
                </li>
              ))}
            </ul>
          )}

          {section.id === "freshness" && (
            <p className="text-xs text-muted-foreground">
              Default thresholds: review after {DEFAULT_FRESHNESS_THRESHOLDS.reviewAfterDays} days,
              stale after {DEFAULT_FRESHNESS_THRESHOLDS.staleAfterDays} days. The Data Room lets
              you tighten the review window.
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
