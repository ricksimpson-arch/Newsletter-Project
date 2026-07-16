import type { Metadata } from "next";
import Link from "next/link";
import {
  ActivityIcon,
  RadarIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { CategoryHeatmap } from "@/components/category-heatmap";
import { LazyQuadrantChart, LazyTop10Bar } from "@/components/charts/lazy";
import {
  ConfidenceIndicator,
  DirectionIndicator,
  RecommendationBadge,
} from "@/components/indicators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { firstWaveAllocation } from "@/data/forecastAssumptions";
import { benchmarkFranchises, franchiseBySlug, franchises } from "@/data/franchises";
import { signalInsights } from "@/data/insights";
import { categoryName } from "@/data/productCategories";
import { forecastDirection } from "@/lib/forecast";
import { RESEARCH_AS_OF } from "@/lib/freshness";
import { roundScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "LootSignal — Executive Dashboard",
};

export default function DashboardPage() {
  const top3 = franchises.slice(0, 3);
  const top10 = franchises.slice(0, 10);
  const sonyLed = franchises.filter((f) => f.ownershipType !== "non-sony");
  const avgScore = roundScore(
    franchises.reduce((sum, f) => sum + f.overallScore, 0) / franchises.length
  );
  const avgConfidence = roundScore(
    franchises.reduce((sum, f) => sum + f.confidenceScore, 0) / franchises.length
  );
  const priorityCount = franchises.filter((f) => f.recommendation === "priority").length;
  const highRiskCount = franchises.filter((f) => f.licensingComplexity >= 7).length;

  const kpis = [
    { label: "Franchises evaluated", value: String(franchises.length) },
    { label: "Sony / PlayStation-led", value: String(sonyLed.length) },
    { label: "Non-Sony benchmarks", value: String(benchmarkFranchises.length) },
    { label: "Average opportunity score", value: avgScore.toFixed(1) },
    { label: "Priority opportunities", value: String(priorityCount) },
    { label: "High licensing risk", value: String(highRiskCount), warn: true },
    { label: "Last research update", value: RESEARCH_AS_OF },
    { label: "Average confidence", value: avgConfidence.toFixed(0) },
  ];

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl border bg-gradient-to-br from-card via-card to-chart-1/10 p-6 lg:p-10">
        <p className="inline-flex items-center gap-2 rounded-full border border-chart-1/40 bg-chart-1/10 px-3 py-1 text-xs font-medium">
          <RadarIcon aria-hidden className="size-3.5 text-chart-1" />
          Internal decision intelligence · research build
        </p>
        <h1 className="mt-4 max-w-3xl text-3xl font-bold tracking-tight lg:text-4xl text-balance">
          The strongest game IP opportunities for physical merchandise
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground lg:text-base">
          LootSignal ranks 50 franchises by demand, fandom depth, design potential, licensing
          feasibility, audience fit, pricing power, and market whitespace — so the team spends its
          time on fandoms worth building for.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/rankings">Explore rankings</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/forecast">Open forecast lab</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/methodology">Review methodology</Link>
          </Button>
        </div>
      </section>

      {/* KPI cards */}
      <section aria-label="Key research indicators">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="py-4">
              <CardContent className="px-4">
                <p
                  className={cn(
                    "tnum text-2xl font-bold tracking-tight",
                    kpi.warn && "text-warning-risk"
                  )}
                >
                  {kpi.value}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Top-3 podium */}
      <section aria-labelledby="podium">
        <h2 id="podium" className="text-lg font-semibold">
          Top 3 opportunities
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {top3.map((franchise) => (
            <Card
              key={franchise.slug}
              className={cn("py-5", franchise.rank === 1 && "border-chart-1/50 bg-chart-1/5")}
            >
              <CardHeader className="px-5">
                <div className="flex items-center justify-between">
                  <span className="tnum text-3xl font-bold text-muted-foreground/50">
                    {franchise.rank}
                  </span>
                  <RecommendationBadge level={franchise.recommendation} />
                </div>
                <CardTitle className="text-xl">
                  <Link
                    href={`/franchises/${franchise.slug}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {franchise.name}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 px-5 text-sm">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tnum text-2xl font-bold">{franchise.overallScore.toFixed(1)}</span>
                  <DirectionIndicator direction={forecastDirection(franchise.forecasts)} />
                  <ConfidenceIndicator score={franchise.confidenceScore} compact />
                </div>
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Best categories:</strong>{" "}
                  {franchise.bestCategories.slice(0, 3).map(categoryName).join(", ")}
                </p>
                <p className="text-xs">
                  <SparklesIcon aria-hidden className="mr-1 inline size-3.5 text-favorable" />
                  {franchise.mainOpportunity}
                </p>
                <p className="text-xs">
                  <TriangleAlertIcon aria-hidden className="mr-1 inline size-3.5 text-warning-risk" />
                  {franchise.mainRisk}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Top 10 chart */}
      <section aria-labelledby="top10">
        <h2 id="top10" className="text-lg font-semibold">
          Top 10 by actionability score
        </h2>
        <div className="mt-3 rounded-lg border p-4">
          <LazyTop10Bar franchises={top10} />
        </div>
      </section>

      {/* Quadrant */}
      <section aria-labelledby="quadrant">
        <h2 id="quadrant" className="text-lg font-semibold">
          Opportunity vs friction
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Where demand meets licensing reality. Priority Build (top right) is where a small company
          should spend first; Strategic Pursuit (top left) has the demand but not the practical
          path.
        </p>
        <div className="mt-3 rounded-lg border p-4">
          <LazyQuadrantChart franchises={franchises} />
        </div>
      </section>

      {/* Signal cards */}
      <section aria-labelledby="signals">
        <h2 id="signals" className="text-lg font-semibold">
          Signal detected
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {signalInsights.map((insight) => {
            const franchise = franchiseBySlug.get(insight.slug);
            if (!franchise) return null;
            return (
              <Card
                key={insight.slug}
                className={cn(
                  "py-4",
                  insight.tone === "opportunity" && "border-opportunity/40",
                  insight.tone === "favorable" && "border-favorable/40",
                  insight.tone === "caution" && "border-warning-risk/40"
                )}
              >
                <CardHeader className="px-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ActivityIcon
                      aria-hidden
                      className={cn(
                        "size-3.5",
                        insight.tone === "opportunity" && "text-opportunity",
                        insight.tone === "favorable" && "text-favorable",
                        insight.tone === "caution" && "text-warning-risk"
                      )}
                    />
                    <span className="uppercase tracking-wide">
                      {insight.tone === "caution" ? "Caution signal" : "Signal detected"}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="tnum">#{franchise.rank}</span>
                  </div>
                  <CardTitle className="text-base">
                    <Link
                      href={`/franchises/${franchise.slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {franchise.name}
                    </Link>
                    <span className="text-muted-foreground"> — {insight.headline}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 text-sm text-muted-foreground">
                  {insight.body}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Category heatmap */}
      <section aria-labelledby="heatmap">
        <h2 id="heatmap" className="text-lg font-semibold">
          Category heatmap — top 10 franchises
        </h2>
        <div className="mt-3 rounded-lg border p-4">
          <CategoryHeatmap
            franchises={top10}
            caption="Category opportunity scores (1–5) for the top 10 franchises across 14 merchandise categories"
          />
        </div>
      </section>

      {/* First-wave allocation */}
      <section aria-labelledby="allocation">
        <h2 id="allocation" className="text-lg font-semibold">
          Recommended first-wave allocation
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          An <strong>editable strategic scenario</strong> for the first merchandise wave — a
          planning starting point, not a guarantee. Adjust it live in the{" "}
          <Link href="/forecast" className="text-primary underline-offset-4 hover:underline">
            forecast lab
          </Link>
          .
        </p>
        <div className="mt-3 rounded-lg border p-4">
          <ul className="space-y-2">
            {firstWaveAllocation.map((slice) => (
              <li
                key={slice.label}
                className="grid grid-cols-[minmax(7rem,10rem)_1fr_3rem] items-center gap-3 text-sm"
              >
                <span className="truncate">
                  {slice.slug ? (
                    <Link
                      href={`/franchises/${slice.slug}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {slice.label}
                    </Link>
                  ) : (
                    slice.label
                  )}
                </span>
                <span
                  aria-hidden
                  className="h-3 rounded-full bg-chart-1"
                  style={{ width: `${slice.percent * 3.2}%`, minWidth: 8 }}
                />
                <span className="tnum text-right text-muted-foreground">{slice.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
