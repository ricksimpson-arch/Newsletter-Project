"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  GitCompareArrowsIcon,
  SearchIcon,
  StarIcon,
  XIcon,
} from "lucide-react";

import {
  ConfidenceIndicator,
  OwnershipBadge,
  RecommendationBadge,
} from "@/components/indicators";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { categoryName, productCategories } from "@/data/productCategories";
import { COMPARE_LIMIT, useCompareSelection } from "@/hooks/use-compare-selection";
import { useWatchlist } from "@/hooks/use-watchlist";
import { downloadTextFile, toCsv } from "@/lib/csv";
import {
  DEFAULT_FILTER,
  filterFranchises,
  sortFranchises,
  type RankingsFilter,
  type SortDirection,
  type SortKey,
} from "@/lib/rankings";
import { RECOMMENDATION_BANDS } from "@/lib/scoring";
import type { Franchise } from "@/lib/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const NUMERIC_COLUMNS: Array<{ key: SortKey; label: string; accessor: (f: Franchise) => string }> = [
  { key: "overallScore", label: "Overall", accessor: (f) => f.overallScore.toFixed(1) },
  { key: "rawDemandScore", label: "Raw demand", accessor: (f) => f.rawDemandScore.toFixed(1) },
  { key: "actionabilityScore", label: "Actionability", accessor: (f) => f.actionabilityScore.toFixed(1) },
  { key: "momentum", label: "Momentum", accessor: (f) => f.criterionScores.momentum.toFixed(1) },
  { key: "visualSuitability", label: "Visual", accessor: (f) => f.criterionScores.visualSuitability.toFixed(1) },
  { key: "licensingFeasibility", label: "Licensing", accessor: (f) => f.criterionScores.licensingFeasibility.toFixed(1) },
  { key: "whitespace", label: "Whitespace", accessor: (f) => f.criterionScores.whitespace.toFixed(1) },
];

function readFilter(params: URLSearchParams): RankingsFilter {
  return {
    q: params.get("q") ?? DEFAULT_FILTER.q,
    ownership: params.get("own") ?? DEFAULT_FILTER.ownership,
    recommendation: params.get("rec") ?? DEFAULT_FILTER.recommendation,
    band: (params.get("band") as RankingsFilter["band"]) ?? DEFAULT_FILTER.band,
    licensing: (params.get("lic") as RankingsFilter["licensing"]) ?? DEFAULT_FILTER.licensing,
    audience: params.get("aud") ?? DEFAULT_FILTER.audience,
    category: params.get("cat") ?? DEFAULT_FILTER.category,
    momentum: (params.get("mom") as RankingsFilter["momentum"]) ?? DEFAULT_FILTER.momentum,
    top: (params.get("top") as RankingsFilter["top"]) ?? DEFAULT_FILTER.top,
  };
}

export function RankingsView({ franchises }: { franchises: Franchise[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filter = readFilter(new URLSearchParams(searchParams.toString()));
  const sortKey = (searchParams.get("sort") as SortKey) ?? "rank";
  const sortDir = (searchParams.get("dir") as SortDirection) ?? "asc";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const watchOnly = searchParams.get("watch") === "1";

  const watchlist = useWatchlist();
  const compare = useCompareSelection();

  const setParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "" || value === "all") next.delete(key);
        else next.set(key, value);
      }
      if (!("page" in updates)) next.delete("page");
      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const filtered = React.useMemo(() => {
    let rows = filterFranchises(franchises, filter);
    if (watchOnly) rows = rows.filter((f) => watchlist.slugs.includes(f.slug));
    return sortFranchises(rows, sortKey, sortDir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [franchises, searchParams, watchOnly, watchlist.slugs, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters =
    searchParams.size > 0 &&
    ["q", "own", "rec", "band", "lic", "aud", "cat", "mom", "top", "watch"].some((k) =>
      searchParams.has(k)
    );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setParams({ sort: key, dir: sortDir === "asc" ? "desc" : "asc" });
    } else {
      setParams({ sort: key, dir: key === "rank" || key === "name" ? "asc" : "desc" });
    }
  }

  function exportCsv() {
    const headers = [
      "Rank",
      "Franchise",
      "Ownership",
      "Overall score",
      "Raw demand",
      "Actionability",
      "Momentum",
      "Visual suitability",
      "Licensing feasibility",
      "Whitespace",
      "Confidence",
      "Recommendation",
      "Best categories",
      "Last verified",
    ];
    const rows = filtered.map((f) => [
      f.rank,
      f.name,
      f.ownershipType,
      f.overallScore,
      f.rawDemandScore,
      f.actionabilityScore,
      f.criterionScores.momentum,
      f.criterionScores.visualSuitability,
      f.criterionScores.licensingFeasibility,
      f.criterionScores.whitespace,
      f.confidenceScore,
      f.recommendation,
      f.bestCategories.map(categoryName).join("; "),
      f.lastVerifiedAt,
    ]);
    downloadTextFile("lootsignal-rankings.csv", toCsv(headers, rows), "text/csv");
  }

  const sortIndicator = (key: SortKey) =>
    sortKey !== key ? (
      <ArrowUpDownIcon aria-hidden className="size-3 opacity-40" />
    ) : sortDir === "asc" ? (
      <ArrowUpIcon aria-hidden className="size-3" />
    ) : (
      <ArrowDownIcon aria-hidden className="size-3" />
    );

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative">
          <SearchIcon aria-hidden className="pointer-events-none absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
          <Input
            type="search"
            value={filter.q}
            onChange={(e) => setParams({ q: e.target.value })}
            placeholder="Search franchises…"
            aria-label="Search franchises"
            className="w-52 pl-8"
          />
        </div>
        <FilterSelect
          label="Ownership"
          value={filter.ownership}
          onChange={(v) => setParams({ own: v })}
          options={[
            ["all", "All ownership"],
            ["sony-family", "Sony / PlayStation-led"],
            ["sony-owned", "Sony-owned"],
            ["playstation-led", "PlayStation-led"],
            ["sony-partner", "Sony partner"],
            ["legacy", "Sony legacy"],
            ["non-sony", "Non-Sony"],
          ]}
        />
        <FilterSelect
          label="Recommendation"
          value={filter.recommendation}
          onChange={(v) => setParams({ rec: v })}
          options={[
            ["all", "All recommendations"],
            ...RECOMMENDATION_BANDS.map((b) => [b.level, b.label] as [string, string]),
          ]}
        />
        <FilterSelect
          label="Score band"
          value={filter.band}
          onChange={(v) => setParams({ band: v })}
          options={[
            ["all", "All scores"],
            ["85+", "85+"],
            ["80-84.9", "80–84.9"],
            ["75-79.9", "75–79.9"],
            ["68-74.9", "68–74.9"],
            ["60-67.9", "60–67.9"],
            ["<60", "Below 60"],
          ]}
        />
        <FilterSelect
          label="Licensing"
          value={filter.licensing}
          onChange={(v) => setParams({ lic: v })}
          options={[
            ["all", "Any licensing"],
            ["low", "Low complexity (≤4)"],
            ["medium", "Medium (5–6)"],
            ["high", "High (7+)"],
          ]}
        />
        <FilterSelect
          label="Audience"
          value={filter.audience}
          onChange={(v) => setParams({ aud: v })}
          options={[
            ["all", "All audiences"],
            ["broad", "Broad"],
            ["family", "Family"],
            ["teen-young-adult", "Teen / young adult"],
            ["adult", "Adult"],
            ["collector-niche", "Collector niche"],
          ]}
        />
        <FilterSelect
          label="Category"
          value={filter.category}
          onChange={(v) => setParams({ cat: v })}
          options={[
            ["all", "All categories"],
            ...productCategories.map((c) => [c.id, c.name] as [string, string]),
          ]}
        />
        <FilterSelect
          label="Momentum"
          value={filter.momentum}
          onChange={(v) => setParams({ mom: v })}
          options={[
            ["all", "Any momentum"],
            ["high", "High (7.5+)"],
            ["medium", "Medium (5–7.4)"],
            ["low", "Low (<5)"],
          ]}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Show top franchises" className="inline-flex rounded-md border">
          {(["10", "25", "all"] as const).map((top) => (
            <Button
              key={top}
              variant={filter.top === top ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none first:rounded-l-md last:rounded-r-md"
              aria-pressed={filter.top === top}
              onClick={() => setParams({ top })}
            >
              {top === "all" ? "All 50" : `Top ${top}`}
            </Button>
          ))}
        </div>
        <Button
          variant={watchOnly ? "secondary" : "ghost"}
          size="sm"
          aria-pressed={watchOnly}
          onClick={() => setParams({ watch: watchOnly ? null : "1" })}
        >
          <StarIcon aria-hidden className={cn(watchOnly && "fill-current")} />
          Watchlist ({watchlist.slugs.length})
        </Button>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <DownloadIcon aria-hidden />
          Export CSV ({filtered.length})
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => router.replace(pathname, { scroll: false })}>
            <XIcon aria-hidden />
            Reset filters
          </Button>
        )}
        <p className="ml-auto text-xs text-muted-foreground tnum" aria-live="polite">
          {filtered.length} of {franchises.length} franchises
        </p>
      </div>

      {/* Compare tray */}
      {compare.slugs.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-chart-1/40 bg-chart-1/5 px-3 py-2">
          <GitCompareArrowsIcon aria-hidden className="size-4 text-chart-1" />
          <span className="text-sm font-medium">
            Compare ({compare.slugs.length}/{COMPARE_LIMIT}):
          </span>
          {compare.slugs.map((slug) => {
            const franchise = franchises.find((f) => f.slug === slug);
            return (
              <Badge key={slug} variant="secondary" className="gap-1">
                {franchise?.name ?? slug}
                <button
                  type="button"
                  aria-label={`Remove ${franchise?.name ?? slug} from comparison`}
                  onClick={() => compare.remove(slug)}
                  className="rounded-full hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            );
          })}
          <Button asChild size="sm" className="ml-auto" disabled={compare.slugs.length < 2}>
            <Link href={`/compare?f=${compare.slugs.join(",")}`}>Open comparison</Link>
          </Button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <p className="font-medium">No franchises match these filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try widening the score band or clearing the search.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => router.replace(pathname, { scroll: false })}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <Table>
              <caption className="sr-only">
                Franchise rankings, sorted by {sortKey} {sortDir}
              </caption>
              <TableHeader className="sticky top-0 z-20 bg-card [&_th]:bg-card">
                <TableRow>
                  <TableHead className="w-8">
                    <span className="sr-only">Watchlist and compare</span>
                  </TableHead>
                  <SortableHead label="Rank" active={sortKey === "rank"} onClick={() => toggleSort("rank")} indicator={sortIndicator("rank")} />
                  <SortableHead label="Franchise" active={sortKey === "name"} onClick={() => toggleSort("name")} indicator={sortIndicator("name")} />
                  <TableHead>Ownership</TableHead>
                  {NUMERIC_COLUMNS.map((col) => (
                    <SortableHead
                      key={col.key}
                      label={col.label}
                      numeric
                      active={sortKey === col.key}
                      onClick={() => toggleSort(col.key)}
                      indicator={sortIndicator(col.key)}
                    />
                  ))}
                  <SortableHead label="Confidence" active={sortKey === "confidenceScore"} onClick={() => toggleSort("confidenceScore")} indicator={sortIndicator("confidenceScore")} />
                  <TableHead>Recommendation</TableHead>
                  <TableHead>Best categories</TableHead>
                  <SortableHead label="Last verified" active={sortKey === "lastVerifiedAt"} onClick={() => toggleSort("lastVerifiedAt")} indicator={sortIndicator("lastVerifiedAt")} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.map((f) => (
                  <TableRow key={f.slug}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={
                            watchlist.has(f.slug)
                              ? `Remove ${f.name} from watchlist`
                              : `Add ${f.name} to watchlist`
                          }
                          aria-pressed={watchlist.has(f.slug)}
                          onClick={() => watchlist.toggle(f.slug)}
                          className="rounded p-0.5 text-muted-foreground hover:text-opportunity focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <StarIcon
                            aria-hidden
                            className={cn("size-4", watchlist.has(f.slug) && "fill-opportunity text-opportunity")}
                          />
                        </button>
                        <Checkbox
                          aria-label={`Select ${f.name} for comparison`}
                          checked={compare.has(f.slug)}
                          disabled={!compare.has(f.slug) && compare.full}
                          onCheckedChange={() => compare.toggle(f.slug)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="tnum font-semibold">{f.rank}</TableCell>
                    <TableCell>
                      <Link
                        href={`/franchises/${f.slug}`}
                        className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded"
                      >
                        {f.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <OwnershipBadge type={f.ownershipType} />
                    </TableCell>
                    {NUMERIC_COLUMNS.map((col) => (
                      <TableCell key={col.key} className="text-right tnum">
                        {col.accessor(f)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <ConfidenceIndicator score={f.confidenceScore} compact />
                    </TableCell>
                    <TableCell>
                      <RecommendationBadge level={f.recommendation} />
                    </TableCell>
                    <TableCell className="max-w-52">
                      <span className="block truncate text-xs text-muted-foreground">
                        {f.bestCategories.slice(0, 3).map(categoryName).join(", ")}
                      </span>
                    </TableCell>
                    <TableCell className="tnum text-xs text-muted-foreground">{f.lastVerifiedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {pageRows.map((f) => (
              <li key={f.slug} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground tnum">#{f.rank}</p>
                    <Link href={`/franchises/${f.slug}`} className="font-semibold underline-offset-4 hover:underline">
                      {f.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={watchlist.has(f.slug) ? `Remove ${f.name} from watchlist` : `Add ${f.name} to watchlist`}
                      aria-pressed={watchlist.has(f.slug)}
                      onClick={() => watchlist.toggle(f.slug)}
                      className="rounded p-1 text-muted-foreground"
                    >
                      <StarIcon aria-hidden className={cn("size-5", watchlist.has(f.slug) && "fill-opportunity text-opportunity")} />
                    </button>
                    <Checkbox
                      aria-label={`Select ${f.name} for comparison`}
                      checked={compare.has(f.slug)}
                      disabled={!compare.has(f.slug) && compare.full}
                      onCheckedChange={() => compare.toggle(f.slug)}
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="tnum text-xl font-bold">{f.overallScore.toFixed(1)}</span>
                  <RecommendationBadge level={f.recommendation} />
                  <OwnershipBadge type={f.ownershipType} />
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between"><dt className="text-muted-foreground">Raw demand</dt><dd className="tnum">{f.rawDemandScore.toFixed(1)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Momentum</dt><dd className="tnum">{f.criterionScores.momentum.toFixed(1)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Licensing</dt><dd className="tnum">{f.criterionScores.licensingFeasibility.toFixed(1)}</dd></div>
                  <div className="flex justify-between"><dt className="text-muted-foreground">Confidence</dt><dd><ConfidenceIndicator score={f.confidenceScore} compact /></dd></div>
                </dl>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {pageCount > 1 && (
            <nav aria-label="Rankings pagination" className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setParams({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>
              <p className="text-xs text-muted-foreground tnum">
                Page {currentPage} of {pageCount}
              </p>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= pageCount}
                onClick={() => setParams({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="grid gap-1">
      <Label className="sr-only">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger size="sm" aria-label={label} className="min-w-32">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map(([optionValue, optionLabel]) => (
            <SelectItem key={optionValue} value={optionValue}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SortableHead({
  label,
  active,
  onClick,
  indicator,
  numeric = false,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  indicator: React.ReactNode;
  numeric?: boolean;
}) {
  return (
    <TableHead aria-sort={active ? undefined : "none"} className={cn(numeric && "text-right")}>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1 rounded font-medium hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          numeric && "flex-row-reverse",
          active ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
        {indicator}
      </button>
    </TableHead>
  );
}
