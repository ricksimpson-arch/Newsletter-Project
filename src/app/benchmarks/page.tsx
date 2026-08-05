import type { Metadata } from "next";
import Link from "next/link";

import { LazyGroupedBars } from "@/components/charts/lazy";
import {
  ConfidenceIndicator,
  OwnershipBadge,
  RecommendationBadge,
} from "@/components/indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { benchmarkFranchises, franchises } from "@/data/franchises";
import { categoryName } from "@/data/productCategories";
import { roundScore } from "@/lib/scoring";

export const metadata: Metadata = {
  title: "Benchmarks — Sony vs Non-Sony",
  description:
    "How the top Sony opportunities compare against Resident Evil, Final Fantasy VII, Elden Ring, Persona, and Metal Gear Solid.",
};

const FRAMING = [
  {
    title: "Sony IP: a direct path",
    body: "Sony and PlayStation-led franchises may offer a single licensing conversation through the official PlayStation licensing program — one rights holder, one approval chain. For a small company, that practicality is worth several points of raw demand.",
  },
  {
    title: "Non-Sony publishers run developed programs",
    body: "Capcom, Square Enix, Bandai Namco, ATLUS, and Konami all operate mature merchandising programs. Their franchises arrive with proven demand and established licensees — which means competing with the publisher's own catalog.",
  },
  {
    title: "Big third-party IP has demand but little whitespace",
    body: "Resident Evil and Elden Ring post enormous audience numbers, but their merch shelves are already full. High demand with saturated supply is a weak first move for a newcomer.",
  },
  {
    title: "High demand can still be a poor first license",
    body: "Final Fantasy VII's collector economics are extraordinary, yet demanding approvals and thin whitespace make it a poor first license for a small company. The benchmarks exist to calibrate expectations, not to be chased first.",
  },
];

export default function BenchmarksPage() {
  const topSony = franchises.filter((f) => f.ownershipType !== "non-sony").slice(0, 5);
  const all = [...topSony, ...benchmarkFranchises];

  const scoreSeries = [
    {
      name: "Top Sony opportunities (avg)",
      values: buildAverages(topSony),
    },
    {
      name: "Non-Sony benchmarks (avg)",
      values: buildAverages(benchmarkFranchises),
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Benchmarks — Sony vs Non-Sony</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Five non-Sony franchises anchor the model against the wider licensed-merch market:
          Resident Evil, Final Fantasy VII, Elden Ring, Persona, and Metal Gear Solid.
        </p>
      </header>

      <section aria-label="Strategic framing" className="grid gap-4 md:grid-cols-2">
        {FRAMING.map((item) => (
          <Card key={item.title} className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 text-sm text-muted-foreground">{item.body}</CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby="group-compare" className="rounded-lg border p-4">
        <h2 id="group-compare" className="mb-3 text-lg font-semibold">
          Group averages
        </h2>
        <LazyGroupedBars
          title="Sony vs non-Sony group averages"
          summary="Average overall score, raw demand, licensing feasibility (×10), whitespace (×10), and confidence for the top five Sony opportunities vs the five non-Sony benchmarks."
          metrics={[
            "Overall score",
            "Raw demand",
            "Licensing feasibility (×10)",
            "Whitespace (×10)",
            "Confidence",
          ]}
          series={scoreSeries}
        />
      </section>

      <section aria-labelledby="benchmark-table">
        <h2 id="benchmark-table" className="text-lg font-semibold">
          Side by side
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Franchise</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead className="text-right">Overall</TableHead>
                <TableHead className="text-right">Raw demand</TableHead>
                <TableHead className="text-right">Momentum</TableHead>
                <TableHead className="text-right">Collector behavior*</TableHead>
                <TableHead className="text-right">Licensing difficulty</TableHead>
                <TableHead className="text-right">Competition†</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {all.map((f) => (
                <TableRow key={f.slug} className={f.isBenchmark ? "bg-muted/30" : undefined}>
                  <TableCell className="font-medium">
                    <Link href={`/franchises/${f.slug}`} className="underline-offset-4 hover:underline">
                      {f.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <OwnershipBadge type={f.ownershipType} ownerLabel={f.rightsProfile.ownerShort} />
                  </TableCell>
                  <TableCell className="text-right tnum">{f.overallScore.toFixed(1)}</TableCell>
                  <TableCell className="text-right tnum">{f.rawDemandScore.toFixed(1)}</TableCell>
                  <TableCell className="text-right tnum">{f.criterionScores.momentum.toFixed(1)}</TableCell>
                  <TableCell className="text-right tnum">{f.criterionScores.priceElasticity.toFixed(1)}</TableCell>
                  <TableCell className="text-right tnum">{f.licensingComplexity}/10</TableCell>
                  <TableCell className="text-right tnum">
                    {roundScore(10 - f.criterionScores.whitespace, 1).toFixed(1)}/10
                  </TableCell>
                  <TableCell>
                    <ConfidenceIndicator score={f.confidenceScore} compact />
                  </TableCell>
                  <TableCell>
                    <RecommendationBadge level={f.recommendation} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          * Pricing-power criterion used as the collector-behavior proxy. † Competition shown as 10
          − whitespace. Shaded rows are the non-Sony benchmarks.
        </p>
      </section>

      <section aria-labelledby="squanch-spotlight">
        <h2 id="squanch-spotlight" className="text-lg font-semibold">
          Studio spotlight: Squanch Games
        </h2>
        <div className="mt-3 rounded-lg border border-opportunity/40 bg-opportunity/5 p-5">
          <p className="text-sm leading-relaxed">
            Squanch Games (founded 2016) is the counter-example to every big-publisher franchise on
            this page: an <strong>independent studio that owns its IP outright</strong> and runs no
            broad licensing program. <Link href="/franchises/high-on-life" className="text-primary underline-offset-4 hover:underline">High on Life</Link>{" "}
            reached 7.5M+ unique players off the biggest third-party Game Pass launch ever, and{" "}
            <strong>High on Life 2</strong> (February 13, 2026; Switch 2 July 1) has the franchise at
            peak activity. Its earlier title <em>Trover Saves the Universe</em> shares the same
            adult-animation design language.
          </p>
          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Why it matters here</h3>
              <p className="mt-1 text-muted-foreground">
                Talking-gun characters and alien creatures are literally characters-as-products —
                plush, vinyl, and novelty apparel fits that big-publisher IP rarely leaves open.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">The licensing angle</h3>
              <p className="mt-1 text-muted-foreground">
                One rights holder, no licensing bureaucracy, no incumbent licensee network — the
                practical opposite of bidding against Disney or Capcom&apos;s programs.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">The caveats</h3>
              <p className="mt-1 text-muted-foreground">
                Game Pass reach inflates player counts vs. paying fans, comedy ages fast, and the
                brand carries baggage from its founder&apos;s 2023 departure. It enters at rank 28,
                Test or Monitor.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="benchmark-detail">
        <h2 id="benchmark-detail" className="text-lg font-semibold">
          Benchmark assessments
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {benchmarkFranchises.map((f) => (
            <Card key={f.slug} className="py-4">
              <CardHeader className="px-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    <Link href={`/franchises/${f.slug}`} className="underline-offset-4 hover:underline">
                      #{f.rank} {f.name}
                    </Link>
                  </CardTitle>
                  <RecommendationBadge level={f.recommendation} />
                </div>
              </CardHeader>
              <CardContent className="px-4">
                {f.benchmarkAssessment ? (
                  <dl className="space-y-2 text-sm">
                    <BenchmarkRow label="Audience scale" value={f.benchmarkAssessment.audienceScale} />
                    <BenchmarkRow label="Collector behavior" value={f.benchmarkAssessment.collectorBehavior} />
                    <BenchmarkRow label="Product breadth" value={f.benchmarkAssessment.productBreadth} />
                    <BenchmarkRow label="Best formats" value={f.benchmarkAssessment.bestFormats} />
                    <BenchmarkRow
                      label="Small-company practicality"
                      value={f.benchmarkAssessment.smallCompanyPracticality}
                    />
                  </dl>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Best categories: {f.bestCategories.map(categoryName).join(", ")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildAverages(group: { overallScore: number; rawDemandScore: number; confidenceScore: number; criterionScores: { licensingFeasibility: number; whitespace: number } }[]) {
  const avg = (fn: (f: (typeof group)[number]) => number) =>
    roundScore(group.reduce((sum, f) => sum + fn(f), 0) / group.length, 1);
  return {
    "Overall score": avg((f) => f.overallScore),
    "Raw demand": avg((f) => f.rawDemandScore),
    "Licensing feasibility (×10)": avg((f) => f.criterionScores.licensingFeasibility * 10),
    "Whitespace (×10)": avg((f) => f.criterionScores.whitespace * 10),
    Confidence: avg((f) => f.confidenceScore),
  };
}

function BenchmarkRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
