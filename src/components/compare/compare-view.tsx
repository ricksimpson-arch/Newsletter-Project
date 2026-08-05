"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlusIcon, XIcon } from "lucide-react";

import { CategoryHeatmap } from "@/components/category-heatmap";
import {
  LazyCriteriaRadar,
  LazyForecastChart,
  LazyGroupedBars,
} from "@/components/charts/lazy";
import {
  ConfidenceIndicator,
  OwnershipBadge,
  RecommendationBadge,
} from "@/components/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { generateComparisonSummary } from "@/lib/compare";
import { CRITERION_KEYS, CRITERION_LABELS, CRITERION_WEIGHTS, roundScore } from "@/lib/scoring";
import { categoryName } from "@/data/productCategories";
import type { Franchise } from "@/lib/types";

const MAX_COMPARE = 4;

export function CompareView({ franchises }: { franchises: Franchise[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const compare = useCompareSelection();

  // URL is the source of truth; the stored selection seeds it when empty.
  const urlSlugs = (searchParams.get("f") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE);

  React.useEffect(() => {
    if (urlSlugs.length === 0 && compare.hydrated && compare.slugs.length > 0) {
      router.replace(`${pathname}?f=${compare.slugs.join(",")}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compare.hydrated]);

  const selection = urlSlugs
    .map((slug) => franchises.find((f) => f.slug === slug))
    .filter((f): f is Franchise => Boolean(f));

  function setSlugs(slugs: string[]) {
    router.replace(slugs.length ? `${pathname}?f=${slugs.join(",")}` : pathname, {
      scroll: false,
    });
  }

  const available = franchises.filter((f) => !urlSlugs.includes(f.slug));

  if (selection.length === 0) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-dashed p-10 text-center">
          <h2 className="font-semibold">No franchises selected</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Pick up to four franchises to compare scores, criteria, categories, and forecasts side
            by side. You can also select them from the{" "}
            <Link href="/rankings" className="text-primary underline-offset-4 hover:underline">
              rankings table
            </Link>
            .
          </p>
          <div className="mx-auto mt-6 flex max-w-xs justify-center">
            <AddFranchiseSelect
              available={available}
              onAdd={(slug) => setSlugs([...urlSlugs, slug])}
            />
          </div>
        </div>
      </div>
    );
  }

  const summary = generateComparisonSummary(selection);

  const scoreSeries = selection.map((f) => ({
    name: f.name,
    values: {
      "Overall score": f.overallScore,
      "Raw demand": f.rawDemandScore,
      Actionability: f.actionabilityScore,
      Confidence: f.confidenceScore,
    },
  }));

  const contributionSeries = selection.map((f) => ({
    name: f.name,
    values: Object.fromEntries(
      CRITERION_KEYS.map((key) => [
        CRITERION_LABELS[key],
        roundScore(f.criterionScores[key] * CRITERION_WEIGHTS[key] * 10, 2),
      ])
    ),
  }));

  return (
    <div className="space-y-8">
      {/* Selector */}
      <div className="flex flex-wrap items-center gap-2">
        {selection.map((f) => (
          <Badge key={f.slug} variant="secondary" className="gap-1.5 py-1.5 pl-3 text-sm">
            {f.name}
            <button
              type="button"
              aria-label={`Remove ${f.name} from comparison`}
              onClick={() => setSlugs(urlSlugs.filter((s) => s !== f.slug))}
              className="rounded-full p-0.5 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <XIcon className="size-3.5" />
            </button>
          </Badge>
        ))}
        {selection.length < MAX_COMPARE && (
          <AddFranchiseSelect available={available} onAdd={(slug) => setSlugs([...urlSlugs, slug])} />
        )}
        {selection.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setSlugs([])}>
            Clear all
          </Button>
        )}
      </div>

      {selection.length === 1 ? (
        <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          Add at least one more franchise to generate the comparison.
        </p>
      ) : (
        <>
          {/* Deterministic summary */}
          <section aria-labelledby="summary" className="rounded-lg border bg-card p-5">
            <h2 id="summary" className="text-lg font-semibold">
              Recommendation summary
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Generated deterministically from the structured research data — no AI involved.
            </p>
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              {summary.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Overview table */}
          <section aria-labelledby="overview">
            <h2 id="overview" className="text-lg font-semibold">
              At a glance
            </h2>
            <div className="mt-3 overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dimension</TableHead>
                    {selection.map((f) => (
                      <TableHead key={f.slug}>
                        <Link
                          href={`/franchises/${f.slug}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {f.name}
                        </Link>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <CompareRow label="Rank" cells={selection.map((f) => `#${f.rank}`)} />
                  <TableRow>
                    <TableCell className="font-medium">Ownership</TableCell>
                    {selection.map((f) => (
                      <TableCell key={f.slug}>
                        <OwnershipBadge type={f.ownershipType} ownerLabel={f.rightsProfile.ownerShort} />
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Recommendation</TableCell>
                    {selection.map((f) => (
                      <TableCell key={f.slug}>
                        <RecommendationBadge level={f.recommendation} />
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Confidence</TableCell>
                    {selection.map((f) => (
                      <TableCell key={f.slug}>
                        <ConfidenceIndicator score={f.confidenceScore} compact />
                      </TableCell>
                    ))}
                  </TableRow>
                  <CompareRow
                    label="Licensing complexity"
                    cells={selection.map((f) => `${f.licensingComplexity}/10`)}
                  />
                  <CompareRow
                    label="Rights holder"
                    cells={selection.map((f) => f.rightsProfile.rightsHolder)}
                  />
                  <CompareRow
                    label="Key competing licensees"
                    cells={selection.map((f) =>
                      f.rightsProfile.competingLicensees.slice(0, 2).join(" · ")
                    )}
                  />
                  <CompareRow label="Audience" cells={selection.map((f) => f.audienceType.replace(/-/g, " "))} />
                  <CompareRow
                    label="Best categories"
                    cells={selection.map((f) =>
                      f.bestCategories.slice(0, 3).map(categoryName).join(", ")
                    )}
                  />
                  <CompareRow
                    label="Price positioning"
                    cells={selection.map((f) => f.merchandiseStrategy.premiumVsVolume)}
                  />
                  <CompareRow
                    label="Market saturation (10 − whitespace)"
                    cells={selection.map(
                      (f) => `${roundScore(10 - f.criterionScores.whitespace, 1)}/10`
                    )}
                  />
                  <CompareRow label="Main opportunity" cells={selection.map((f) => f.mainOpportunity)} />
                  <CompareRow label="Main risk" cells={selection.map((f) => f.mainRisk)} />
                </TableBody>
              </Table>
            </div>
          </section>

          {/* Charts */}
          <section aria-labelledby="scores" className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h2 id="scores" className="mb-3 text-base font-semibold">
                Scores
              </h2>
              <LazyGroupedBars
                title="Score comparison"
                summary={`Overall, raw demand, actionability, and confidence for ${selection.map((f) => f.name).join(", ")}.`}
                metrics={["Overall score", "Raw demand", "Actionability", "Confidence"]}
                series={scoreSeries}
              />
            </div>
            <div className="rounded-lg border p-4">
              <h2 className="mb-3 text-base font-semibold">Criterion profile</h2>
              <LazyCriteriaRadar franchises={selection} />
            </div>
          </section>

          <section aria-labelledby="contribution" className="rounded-lg border p-4">
            <h2 id="contribution" className="mb-3 text-base font-semibold">
              Score contribution by criterion
            </h2>
            <LazyGroupedBars
              title="Weighted criterion contributions"
              summary="Each criterion's weighted contribution (in points) to the overall score."
              metrics={CRITERION_KEYS.map((key) => CRITERION_LABELS[key])}
              series={contributionSeries}
              max={25}
            />
          </section>

          <section aria-labelledby="categories">
            <h2 id="categories" className="text-lg font-semibold">
              Category fit
            </h2>
            <div className="mt-3 rounded-lg border p-4">
              <CategoryHeatmap
                franchises={selection}
                caption={`Category opportunity scores for ${selection.map((f) => f.name).join(", ")}`}
              />
            </div>
          </section>

          <section aria-labelledby="forecasts">
            <h2 id="forecasts" className="text-lg font-semibold">
              Forecasts
            </h2>
            <div className="mt-3 rounded-lg border p-4">
              <LazyForecastChart franchises={selection} height={320} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function CompareRow({ label, cells }: { label: string; cells: string[] }) {
  return (
    <TableRow>
      <TableCell className="font-medium">{label}</TableCell>
      {cells.map((cell, index) => (
        <TableCell key={index} className="max-w-56 whitespace-normal text-sm">
          {cell}
        </TableCell>
      ))}
    </TableRow>
  );
}

function AddFranchiseSelect({
  available,
  onAdd,
}: {
  available: Franchise[];
  onAdd: (slug: string) => void;
}) {
  return (
    <Select value="" onValueChange={onAdd}>
      <SelectTrigger size="sm" aria-label="Add franchise to comparison" className="min-w-48">
        <PlusIcon aria-hidden className="size-3.5" />
        <SelectValue placeholder="Add franchise…" />
      </SelectTrigger>
      <SelectContent>
        {available.map((f) => (
          <SelectItem key={f.slug} value={f.slug}>
            #{f.rank} {f.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
