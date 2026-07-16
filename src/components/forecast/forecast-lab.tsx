"use client";

import * as React from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DownloadIcon,
  RotateCcwIcon,
  SaveIcon,
  UploadIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ConfidenceIndicator } from "@/components/indicators";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { downloadTextFile } from "@/lib/csv";
import { FORECAST_DISCLAIMER } from "@/lib/forecast";
import {
  RESEARCH_SCENARIO,
  SCENARIO_PRESETS,
  computeScenarioResults,
  normalizeWeightsTo100,
  scenarioSchema,
  weightsTotal,
  type Scenario,
} from "@/lib/scenario";
import { CRITERION_KEYS, CRITERION_LABELS } from "@/lib/scoring";
import { categoryName } from "@/data/productCategories";
import type { CriterionKey, Franchise } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCENARIOS_KEY = "lootsignal:scenarios";
const NO_SCENARIOS: Scenario[] = [];

export function ForecastLab({ franchises }: { franchises: Franchise[] }) {
  const [scenario, setScenario] = React.useState<Scenario>({ ...RESEARCH_SCENARIO });
  const [savedScenarios, setSavedScenarios] = useLocalStorage<Scenario[]>(
    SCENARIOS_KEY,
    NO_SCENARIOS
  );
  const [importError, setImportError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const results = React.useMemo(
    () => computeScenarioResults(franchises, scenario),
    [franchises, scenario]
  );

  const total = weightsTotal(scenario.weights);
  const totalOk = Math.abs(total - 100) < 0.05;

  function setWeight(key: CriterionKey, value: number) {
    setScenario((prev) => ({ ...prev, weights: { ...prev.weights, [key]: value } }));
  }

  function set<K extends keyof Scenario>(key: K, value: Scenario[K]) {
    setScenario((prev) => ({ ...prev, [key]: value }));
  }

  function exportScenario() {
    downloadTextFile(
      `lootsignal-scenario-${scenario.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.json`,
      JSON.stringify(scenario, null, 2),
      "application/json"
    );
  }

  function importScenario(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = scenarioSchema.parse(JSON.parse(String(reader.result)));
        setScenario(parsed);
        setImportError(null);
      } catch {
        setImportError("That file is not a valid LootSignal scenario. Nothing was changed.");
      }
    };
    reader.readAsText(file);
  }

  function saveScenario() {
    const name = scenario.name === RESEARCH_SCENARIO.name ? `Scenario ${savedScenarios.length + 1}` : scenario.name;
    const toSave = { ...scenario, name };
    setSavedScenarios((prev) => [...prev.filter((s) => s.name !== name), toSave]);
    setScenario(toSave);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(20rem,26rem)_1fr]">
      {/* Controls */}
      <div className="space-y-4">
        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Presets</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 px-4">
            {SCENARIO_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant={scenario.name === preset.label ? "secondary" : "outline"}
                size="sm"
                data-testid={`preset-${preset.id}`}
                title={preset.description}
                onClick={() => setScenario({ ...preset.scenario })}
              >
                {preset.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              data-testid="restore-research-model"
              onClick={() => setScenario({ ...RESEARCH_SCENARIO })}
            >
              <RotateCcwIcon aria-hidden />
              Restore research model
            </Button>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Criterion weights</CardTitle>
              <span
                className={cn("tnum text-xs font-semibold", totalOk ? "text-favorable" : "text-warning-risk")}
                aria-live="polite"
              >
                Total {total.toFixed(1)}%
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
            {CRITERION_KEYS.map((key) => (
              <div key={key} className="grid gap-1">
                <div className="flex items-center justify-between text-xs">
                  <Label htmlFor={`weight-${key}`}>{CRITERION_LABELS[key]}</Label>
                  <span className="tnum text-muted-foreground">{scenario.weights[key].toFixed(0)}%</span>
                </div>
                <Slider
                  id={`weight-${key}`}
                  aria-label={`${CRITERION_LABELS[key]} weight`}
                  min={0}
                  max={40}
                  step={1}
                  value={[scenario.weights[key]]}
                  onValueChange={([value]) => setWeight(key, value)}
                />
              </div>
            ))}
            {!totalOk && (
              <p className="text-xs text-warning-risk">
                Weights must total 100% — results below use the normalized equivalent.
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setScenario((prev) => ({ ...prev, weights: normalizeWeightsTo100(prev.weights) }))
              }
            >
              Normalize to 100%
            </Button>
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Scenario controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4">
            <div className="grid gap-1">
              <Label htmlFor="horizon" className="text-xs">
                Forecast horizon
              </Label>
              <Select
                value={String(scenario.horizonMonths)}
                onValueChange={(v) => set("horizonMonths", Number(v) as Scenario["horizonMonths"])}
              >
                <SelectTrigger id="horizon" size="sm" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 months</SelectItem>
                  <SelectItem value="12">12 months</SelectItem>
                  <SelectItem value="24">24 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ControlSlider label="Release catalyst importance" value={scenario.releaseCatalystImportance} min={0} max={2} step={0.1} onChange={(v) => set("releaseCatalystImportance", v)} format={(v) => `${v.toFixed(1)}×`} />
            <ControlSlider label="Transmedia importance" value={scenario.transmediaImportance} min={0} max={2} step={0.1} onChange={(v) => set("transmediaImportance", v)} format={(v) => `${v.toFixed(1)}×`} />
            <ControlSlider label="Licensing-risk tolerance" value={scenario.licensingRiskTolerance} min={0} max={10} step={1} onChange={(v) => set("licensingRiskTolerance", v)} format={(v) => `${v}/10`} />
            <ControlSlider label="Minimum confidence threshold" value={scenario.minConfidence} min={0} max={100} step={5} onChange={(v) => set("minConfidence", v)} format={(v) => `${v}`} />
            <ControlSlider label="Evergreen ↔ trend preference" value={scenario.evergreenVsTrend} min={-1} max={1} step={0.1} onChange={(v) => set("evergreenVsTrend", v)} format={(v) => (v === 0 ? "Neutral" : v < 0 ? `Evergreen ${Math.abs(v).toFixed(1)}` : `Trend ${v.toFixed(1)}`)} />
            <ControlSlider label="Low-MOQ preference" value={scenario.lowMoqPreference} min={0} max={2} step={0.5} onChange={(v) => set("lowMoqPreference", v)} format={(v) => v.toFixed(1)} />
            <ControlSlider label="High-AOV collectibles preference" value={scenario.highAovCollectiblesPreference} min={0} max={2} step={0.5} onChange={(v) => set("highAovCollectiblesPreference", v)} format={(v) => v.toFixed(1)} />
            <ControlSlider label="Apparel preference" value={scenario.apparelPreference} min={0} max={2} step={0.5} onChange={(v) => set("apparelPreference", v)} format={(v) => v.toFixed(1)} />
            <ControlSlider label="Family-friendly preference" value={scenario.familyFriendlyPreference} min={0} max={2} step={0.5} onChange={(v) => set("familyFriendlyPreference", v)} format={(v) => v.toFixed(1)} />
          </CardContent>
        </Card>

        <Card className="py-4">
          <CardHeader className="px-4">
            <CardTitle className="text-sm">Save / share scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4">
            <div className="grid gap-1">
              <Label htmlFor="scenario-name" className="text-xs">
                Scenario name
              </Label>
              <Input
                id="scenario-name"
                value={scenario.name}
                onChange={(e) => set("name", e.target.value)}
                maxLength={120}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={saveScenario}>
                <SaveIcon aria-hidden /> Save locally
              </Button>
              <Button variant="outline" size="sm" data-testid="export-scenario" onClick={exportScenario}>
                <DownloadIcon aria-hidden /> Export JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <UploadIcon aria-hidden /> Import JSON
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="sr-only"
                aria-label="Import scenario JSON"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importScenario(file);
                  e.target.value = "";
                }}
              />
            </div>
            {importError && (
              <p role="alert" className="text-xs text-warning-risk">
                {importError}
              </p>
            )}
            {savedScenarios.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium">Saved scenarios</p>
                <ul className="space-y-1">
                  {savedScenarios.map((saved) => (
                    <li key={saved.name} className="flex items-center justify-between gap-2 text-xs">
                      <button
                        type="button"
                        className="truncate text-left text-primary underline-offset-4 hover:underline"
                        onClick={() => setScenario({ ...saved })}
                      >
                        {saved.name}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete scenario ${saved.name}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() =>
                          setSavedScenarios((prev) => prev.filter((s) => s.name !== saved.name))
                        }
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="min-w-0 space-y-6">
        <section aria-labelledby="movers" className="grid gap-4 md:grid-cols-2">
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle id="movers" className="flex items-center gap-2 text-sm">
                <ArrowUpIcon aria-hidden className="size-4 text-favorable" /> Biggest risers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {results.risers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No rank improvements under this scenario.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {results.risers.map((row) => (
                    <li key={row.franchise.slug} className="flex items-center justify-between gap-2">
                      <span>{row.franchise.name}</span>
                      <span className="tnum text-xs text-favorable">
                        #{row.defaultRank} → #{row.rank} (+{row.rankChange})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ArrowDownIcon aria-hidden className="size-4 text-warning-risk" /> Biggest fallers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              {results.fallers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No rank declines under this scenario.</p>
              ) : (
                <ul className="space-y-1.5 text-sm">
                  {results.fallers.map((row) => (
                    <li key={row.franchise.slug} className="flex items-center justify-between gap-2">
                      <span>{row.franchise.name}</span>
                      <span className="tnum text-xs text-warning-risk">
                        #{row.defaultRank} → #{row.rank} ({row.rankChange})
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="scenario-allocation" className="grid gap-4 md:grid-cols-2">
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle id="scenario-allocation" className="text-sm">
                Updated first-wave allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <ul className="space-y-1.5">
                {results.allocation.map((slice) => (
                  <li key={slice.label} className="grid grid-cols-[1fr_auto] items-center gap-2 text-sm">
                    <span className="truncate">{slice.label}</span>
                    <span className="tnum text-xs text-muted-foreground">{slice.percent}%</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Editable strategic scenario — not a guarantee of returns.
              </p>
            </CardContent>
          </Card>
          <Card className="py-4">
            <CardHeader className="px-4">
              <CardTitle className="text-sm">Updated category recommendations</CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <ol className="list-decimal space-y-1.5 pl-5 text-sm">
                {results.topCategories.map((category) => (
                  <li key={category.categoryId}>{categoryName(category.categoryId)}</li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Weighted by the best-category lists of the scenario&apos;s top 10.
              </p>
            </CardContent>
          </Card>
        </section>

        {results.excluded.length > 0 && (
          <section
            aria-labelledby="excluded"
            className="rounded-lg border border-warning-risk/30 bg-warning-risk/5 p-4"
          >
            <h2 id="excluded" className="text-sm font-semibold">
              Excluded by confidence threshold ({results.excluded.length})
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              These franchises fall below the minimum confidence of {scenario.minConfidence}.
            </p>
            <p className="mt-2 text-sm">
              {results.excluded.map((row) => row.franchise.name).join(" · ")}
            </p>
          </section>
        )}

        <section aria-labelledby="scenario-ranking">
          <h2 id="scenario-ranking" className="text-lg font-semibold">
            Scenario ranking
          </h2>
          <div className="mt-3 overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader className="sticky top-0 bg-card [&_th]:bg-card">
                <TableRow>
                  <TableHead className="text-right">Rank</TableHead>
                  <TableHead>Franchise</TableHead>
                  <TableHead className="text-right">Scenario score</TableHead>
                  <TableHead className="text-right">Default score</TableHead>
                  <TableHead className="text-right">Δ score</TableHead>
                  <TableHead className="text-right">Rank change</TableHead>
                  <TableHead>Confidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.included.map((row) => (
                  <TableRow key={row.franchise.slug} data-testid={`scenario-row-${row.franchise.slug}`} data-rank={row.rank}>
                    <TableCell className="text-right tnum font-semibold">{row.rank}</TableCell>
                    <TableCell className="font-medium">{row.franchise.name}</TableCell>
                    <TableCell className="text-right tnum">{row.score.toFixed(1)}</TableCell>
                    <TableCell className="text-right tnum text-muted-foreground">
                      {row.defaultScore.toFixed(1)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tnum",
                        row.delta > 0 && "text-favorable",
                        row.delta < 0 && "text-warning-risk"
                      )}
                    >
                      {row.delta > 0 ? "+" : ""}
                      {row.delta.toFixed(1)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tnum",
                        row.rankChange > 0 && "text-favorable",
                        row.rankChange < 0 && "text-warning-risk"
                      )}
                    >
                      {row.rankChange > 0 ? `▲ ${row.rankChange}` : row.rankChange < 0 ? `▼ ${Math.abs(row.rankChange)}` : "—"}
                    </TableCell>
                    <TableCell>
                      <ConfidenceIndicator score={row.franchise.confidenceScore} compact />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <p className="rounded-md border border-forecast/30 bg-forecast/5 p-3 text-xs text-muted-foreground">
          {FORECAST_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format: (value: number) => string;
}) {
  const id = `control-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <div className="grid gap-1">
      <div className="flex items-center justify-between text-xs">
        <Label htmlFor={id}>{label}</Label>
        <span className="tnum text-muted-foreground">{format(value)}</span>
      </div>
      <Slider
        id={id}
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
    </div>
  );
}
