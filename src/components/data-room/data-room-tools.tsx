"use client";

import * as React from "react";
import { DownloadIcon, UploadIcon } from "lucide-react";

import { FreshnessBadge } from "@/components/indicators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { downloadTextFile, toCsv } from "@/lib/csv";
import { daysBetween, freshnessStatus, RESEARCH_AS_OF } from "@/lib/freshness";
import { franchiseListSchema } from "@/lib/schemas";
import type { Franchise, ResearchSource } from "@/lib/types";

export function DataRoomTools({
  franchises,
  sources,
}: {
  franchises: Franchise[];
  sources: ResearchSource[];
}) {
  const [reviewDays, setReviewDays] = React.useState(180);
  const [importReport, setImportReport] = React.useState<string[] | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const approaching = sources
    .map((source) => {
      const date = source.publishedAt ?? source.accessedAt;
      const age = daysBetween(date, RESEARCH_AS_OF);
      return { source, age, remaining: reviewDays - age };
    })
    .filter((row) => row.remaining <= 45)
    .sort((a, b) => a.remaining - b.remaining);

  function exportDatasetJson() {
    downloadTextFile(
      "lootsignal-dataset.json",
      JSON.stringify({ exportedAt: RESEARCH_AS_OF, franchises, sources }, null, 2),
      "application/json"
    );
  }

  function exportSourceAuditCsv() {
    const csv = toCsv(
      ["ID", "Title", "Publisher", "Tier", "Published", "Accessed", "Freshness", "URL", "Notes"],
      sources.map((s) => [
        s.id,
        s.title,
        s.publisher,
        s.tier,
        s.publishedAt ?? "not dated",
        s.accessedAt,
        freshnessStatus(s.publishedAt ?? s.accessedAt),
        s.url,
        s.notes ?? "",
      ])
    );
    downloadTextFile("lootsignal-source-audit.csv", csv, "text/csv");
  }

  function exportFranchisesCsv() {
    const csv = toCsv(
      ["Rank", "Franchise", "Ownership", "Overall", "Raw demand", "Confidence", "Recommendation", "Last verified"],
      franchises.map((f) => [
        f.rank,
        f.name,
        f.ownershipType,
        f.overallScore,
        f.rawDemandScore,
        f.confidenceScore,
        f.recommendation,
        f.lastVerifiedAt,
      ])
    );
    downloadTextFile("lootsignal-franchises.csv", csv, "text/csv");
  }

  function validateImport(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed: unknown = JSON.parse(String(reader.result));
        const list = Array.isArray(parsed)
          ? parsed
          : (parsed as { franchises?: unknown })?.franchises;
        const result = franchiseListSchema.safeParse(list);
        if (result.success) {
          setImportReport([
            `Valid dataset: ${result.data.length} franchises passed every schema and consistency check.`,
            "Import is validation-only in this build — verified seed data is never overwritten silently. To adopt the data, replace the seed files in src/data and re-run the test suite.",
          ]);
        } else {
          const issues = result.error.issues.slice(0, 8).map(
            (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`
          );
          setImportReport([
            `Validation failed with ${result.error.issues.length} issue(s):`,
            ...issues,
            ...(result.error.issues.length > 8 ? ["…and more."] : []),
          ]);
        }
      } catch {
        setImportReport(["Not valid JSON — nothing was processed."]);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Exports</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-4">
          <Button variant="outline" size="sm" onClick={exportDatasetJson}>
            <DownloadIcon aria-hidden /> Dataset JSON
          </Button>
          <Button variant="outline" size="sm" onClick={exportFranchisesCsv}>
            <DownloadIcon aria-hidden /> Franchises CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportSourceAuditCsv}>
            <DownloadIcon aria-hidden /> Source audit CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Import validation (read-only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 px-4">
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <UploadIcon aria-hidden /> Validate a dataset JSON…
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="sr-only"
            aria-label="Validate dataset JSON"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) validateImport(file);
              e.target.value = "";
            }}
          />
          {importReport && (
            <ul role="status" className="space-y-1 rounded-md border bg-muted/40 p-3 text-xs">
              {importReport.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted-foreground">
            Uploaded files are validated against the full Zod schema and never replace verified
            data automatically.
          </p>
        </CardContent>
      </Card>

      <Card className="py-4 lg:col-span-2">
        <CardHeader className="px-4">
          <CardTitle className="text-sm">Sources approaching review threshold</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4">
          <div className="grid max-w-sm gap-1">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="review-days">Review threshold</Label>
              <span className="tnum text-muted-foreground">{reviewDays} days</span>
            </div>
            <Slider
              id="review-days"
              aria-label="Review threshold in days"
              min={30}
              max={365}
              step={15}
              value={[reviewDays]}
              onValueChange={([v]) => setReviewDays(v)}
            />
          </div>
          {approaching.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sources are within 45 days of the {reviewDays}-day review threshold.
            </p>
          ) : (
            <ul className="divide-y rounded-md border text-sm">
              {approaching.map(({ source, age, remaining }) => (
                <li key={source.id} className="flex flex-wrap items-center justify-between gap-2 p-2.5">
                  <span className="min-w-0 flex-1 truncate">{source.title}</span>
                  <span className="tnum text-xs text-muted-foreground">
                    {age} days old ·{" "}
                    {remaining <= 0 ? `${Math.abs(remaining)} days past review` : `${remaining} days until review`}
                  </span>
                  <FreshnessBadge status={freshnessStatus(source.publishedAt ?? source.accessedAt)} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
