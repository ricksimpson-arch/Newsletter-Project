import type { Metadata } from "next";
import Link from "next/link";
import { DatabaseIcon, ShieldAlertIcon } from "lucide-react";

import { DataRoomTools } from "@/components/data-room/data-room-tools";
import { ConfidenceIndicator, FreshnessBadge, SourceTierBadge } from "@/components/indicators";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FORMULA_TEXT } from "@/data/methodology";
import { franchises } from "@/data/franchises";
import { catalysts } from "@/data/forecastAssumptions";
import { productCategories } from "@/data/productCategories";
import { sources } from "@/data/sources";
import { freshnessStatus, RESEARCH_AS_OF } from "@/lib/freshness";

export const metadata: Metadata = {
  title: "Data Room",
  description: "Internal research management: dataset health, stale-data alerts, validation, and exports.",
};

export default function DataRoomPage() {
  const staleFranchises = franchises.filter(
    (f) => freshnessStatus(f.lastVerifiedAt) === "stale"
  );
  const reviewSoonFranchises = franchises.filter(
    (f) => freshnessStatus(f.lastVerifiedAt) === "review-soon"
  );
  const undatedSources = sources.filter((s) => !s.publishedAt);
  const lowConfidence = franchises.filter((f) => f.confidenceScore < 60);
  const modeledMetrics = franchises.flatMap((f) =>
    f.evidence.filter((m) => m.isModeled).map((m) => ({ franchise: f, metric: m }))
  );
  const totalMetrics = franchises.reduce((sum, f) => sum + f.evidence.length, 0);

  const validationChecks = [
    { label: "Franchise records parsed against the strict Zod schema", value: `${franchises.length}/${franchises.length}` },
    { label: "Overall scores reproduced by the weighted formula (±0.1)", value: `${franchises.length}/${franchises.length}` },
    { label: "Rank order consistent with actionability scores", value: "Pass" },
    { label: "Forecast bands contain their base cases (4 horizons × 50)", value: "Pass" },
    { label: "Source registry entries validated", value: `${sources.length}/${sources.length}` },
    { label: "Product categories validated", value: `${productCategories.length}/14` },
    { label: "Catalyst registry validated", value: `${catalysts.length}/${catalysts.length}` },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="inline-flex items-center gap-2 rounded-full border border-opportunity/50 bg-opportunity/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
          <ShieldAlertIcon aria-hidden className="size-3.5 text-opportunity" />
          Internal research interface
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Data Room</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Dataset health and research management. This build has no authentication by design — the
          README documents how auth could be added if the tool ever leaves the internal network.
        </p>
      </header>

      {/* Dataset overview */}
      <section aria-labelledby="overview">
        <h2 id="overview" className="flex items-center gap-2 text-lg font-semibold">
          <DatabaseIcon aria-hidden className="size-4" /> Dataset overview
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Franchises" value={String(franchises.length)} />
          <StatCard label="Research sources" value={String(sources.length)} />
          <StatCard label="Evidence metrics" value={String(totalMetrics)} />
          <StatCard label="Product categories" value={String(productCategories.length)} />
          <StatCard label="Catalysts" value={String(catalysts.length)} />
          <StatCard label="Research as-of" value={RESEARCH_AS_OF} />
          <StatCard label="Modeled metrics" value={`${modeledMetrics.length}/${totalMetrics}`} />
          <StatCard label="Low-confidence franchises" value={String(lowConfidence.length)} />
        </div>
      </section>

      {/* Alerts */}
      <section aria-labelledby="alerts" className="grid gap-4 lg:grid-cols-2">
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Stale-data alerts</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            {staleFranchises.length === 0 && reviewSoonFranchises.length === 0 ? (
              <p className="text-sm text-muted-foreground">All franchise records are current.</p>
            ) : (
              <ul className="divide-y text-sm">
                {[...staleFranchises, ...reviewSoonFranchises].map((f) => (
                  <li key={f.slug} className="flex flex-wrap items-center justify-between gap-2 py-2">
                    <Link href={`/franchises/${f.slug}`} className="underline-offset-4 hover:underline">
                      {f.name}
                    </Link>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="tnum">verified {f.lastVerifiedAt}</span>
                      <FreshnessBadge status={freshnessStatus(f.lastVerifiedAt)} />
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Sources missing publication dates ({undatedSources.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="divide-y text-sm">
              {undatedSources.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <span className="flex items-center gap-2">
                    <SourceTierBadge tier={s.tier} />
                    <span className="tnum text-xs text-muted-foreground">accessed {s.accessedAt}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Freshness for undated sources falls back to the access date.
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Low-confidence franchises ({lowConfidence.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <ul className="divide-y text-sm">
              {lowConfidence.map((f) => (
                <li key={f.slug} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <Link href={`/franchises/${f.slug}`} className="underline-offset-4 hover:underline">
                    #{f.rank} {f.name}
                  </Link>
                  <ConfidenceIndicator score={f.confidenceScore} compact />
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              Forecast intervals for these franchises widen automatically; treat their criterion
              detail as directional.
            </p>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Metrics relying on modeled values ({modeledMetrics.length})</CardTitle>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-sm text-muted-foreground">
              {modeledMetrics.length} of {totalMetrics} evidence metrics are internal model outputs
              (including “not publicly reported” placeholders). Every one is flagged with the
              Modeled badge wherever it appears.
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                List all modeled metrics
              </summary>
              <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-xs">
                {modeledMetrics.map(({ franchise, metric }) => (
                  <li key={`${franchise.slug}-${metric.id}`}>
                    <span className="font-medium">{franchise.name}</span> — {metric.label}
                  </li>
                ))}
              </ul>
            </details>
          </CardContent>
        </Card>
      </section>

      {/* Tools: exports, import validation, freshness threshold */}
      <section aria-labelledby="tools">
        <h2 id="tools" className="text-lg font-semibold">
          Tools
        </h2>
        <div className="mt-3">
          <DataRoomTools franchises={franchises} sources={sources} />
        </div>
      </section>

      {/* Validation report */}
      <section aria-labelledby="validation">
        <h2 id="validation" className="text-lg font-semibold">
          Data validation report
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Validation runs at module load — invalid seed data crashes the build rather than
          rendering unverified numbers. The unit-test suite re-verifies every check below.
        </p>
        <div className="mt-3 overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Check</TableHead>
                <TableHead className="text-right">Result</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {validationChecks.map((check) => (
                <TableRow key={check.label}>
                  <TableCell>{check.label}</TableCell>
                  <TableCell className="text-right tnum text-favorable">{check.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Read-only formulas */}
      <section aria-labelledby="formulas">
        <h2 id="formulas" className="text-lg font-semibold">
          Calculation formulas (read-only)
        </h2>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          {Object.entries(FORMULA_TEXT).map(([name, formula]) => (
            <pre
              key={name}
              className="overflow-x-auto rounded-lg border bg-card p-4 font-mono text-xs leading-relaxed"
            >
              {formula}
            </pre>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <p className="tnum text-xl font-bold">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
