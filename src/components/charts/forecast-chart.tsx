"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_STYLE, ChartShell } from "@/components/charts/chart-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { catalystById } from "@/data/forecastAssumptions";
import { FORECAST_DISCLAIMER } from "@/lib/forecast";
import type { Franchise } from "@/lib/types";

const SERIES_COLORS = ["var(--chart-3)", "var(--chart-1)", "var(--chart-2)", "var(--chart-4)"];

/**
 * Forecast line(s) with a low/high confidence band. Single-franchise
 * mode shows the band and catalyst annotations; multi-franchise mode
 * (compare) overlays base cases only.
 */
export default function ForecastChart({
  franchises,
  height = 300,
}: {
  franchises: Franchise[];
  height?: number;
}) {
  const single = franchises.length === 1;
  const horizons = [0, 6, 12, 24] as const;
  const data = horizons.map((h) => {
    const row: Record<string, number | string | [number, number]> = {
      horizon: h,
      label: h === 0 ? "Now" : `${h} mo`,
    };
    for (const f of franchises) {
      const point = f.forecasts.find((p) => p.horizonMonths === h)!;
      row[f.name] = point.projectedScore;
      if (single) {
        row.band = [point.lowCase, point.highCase];
        row.high = point.highCase;
        row.low = point.lowCase;
      }
    }
    return row;
  });

  const catalysts = single
    ? franchises[0].catalystIds
        .map((id) => catalystById.get(id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
    : [];

  return (
    <ChartShell
      title="Opportunity forecast"
      summary={
        single
          ? `Base, low, and high forecast cases for ${franchises[0].name} at 6, 12, and 24 months; the shaded band is the low–high interval.`
          : `Base-case forecast lines for ${franchises.map((f) => f.name).join(", ")} at 6, 12, and 24 months.`
      }
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horizon</TableHead>
              {franchises.map((f) => (
                <TableHead key={f.slug} className="text-right">
                  {f.name} {single ? "(low / base / high)" : "(base)"}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {horizons.map((h) => (
              <TableRow key={h}>
                <TableCell>{h === 0 ? "Now" : `${h} months`}</TableCell>
                {franchises.map((f) => {
                  const point = f.forecasts.find((p) => p.horizonMonths === h)!;
                  return (
                    <TableCell key={f.slug} className="text-right tnum">
                      {single
                        ? `${point.lowCase.toFixed(1)} / ${point.projectedScore.toFixed(1)} / ${point.highCase.toFixed(1)}`
                        : point.projectedScore.toFixed(1)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid stroke={CHART_STYLE.grid} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="label" tick={CHART_STYLE.tick} stroke={CHART_STYLE.grid} />
            <YAxis
              domain={[
                (min: number) => Math.max(0, Math.floor(min - 4)),
                (max: number) => Math.min(100, Math.ceil(max + 4)),
              ]}
              tick={CHART_STYLE.tick}
              stroke={CHART_STYLE.grid}
              width={36}
            />
            <Tooltip
              contentStyle={CHART_STYLE.tooltip}
              formatter={(value, name) => {
                if (Array.isArray(value)) {
                  return [`${Number(value[0]).toFixed(1)} – ${Number(value[1]).toFixed(1)}`, "Low–high band"];
                }
                return [Number(value).toFixed(1), String(name)];
              }}
            />
            {single && (
              <>
                <Area
                  dataKey="band"
                  stroke="none"
                  fill="var(--forecast)"
                  fillOpacity={0.16}
                  isAnimationActive={false}
                  name="Low–high band"
                />
                <Line
                  dataKey="high"
                  stroke="var(--forecast)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  name="High case"
                />
                <Line
                  dataKey="low"
                  stroke="var(--forecast)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                  name="Low case"
                />
              </>
            )}
            {franchises.map((f, index) => (
              <Line
                key={f.slug}
                dataKey={f.name}
                stroke={single ? "var(--forecast)" : SERIES_COLORS[index]}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 0, fill: single ? "var(--forecast)" : SERIES_COLORS[index] }}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {!single && (
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground" aria-hidden>
          {franchises.map((f, index) => (
            <span key={f.slug} className="inline-flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 rounded" style={{ backgroundColor: SERIES_COLORS[index] }} />
              {f.name}
            </span>
          ))}
        </div>
      )}
      {single && catalysts.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {catalysts.map((catalyst) => (
            <li key={catalyst.id}>
              <span className="font-medium text-foreground">{catalyst.label}</span>
              {catalyst.confirmed ? "" : " (unconfirmed — scenario assumption)"} — {catalyst.note}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 rounded-md border border-forecast/30 bg-forecast/5 p-2 text-xs text-muted-foreground">
        {FORECAST_DISCLAIMER}
      </p>
    </ChartShell>
  );
}
