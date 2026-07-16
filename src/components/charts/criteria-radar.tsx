"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CHART_STYLE, ChartShell } from "@/components/charts/chart-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITERION_KEYS, CRITERION_LABELS } from "@/lib/scoring";
import type { Franchise } from "@/lib/types";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

/** Radar of the 8 criteria for 1–4 franchises, paired with a table. */
export default function CriteriaRadar({ franchises }: { franchises: Franchise[] }) {
  const data = CRITERION_KEYS.map((key) => {
    const row: Record<string, string | number> = { criterion: CRITERION_LABELS[key] };
    for (const franchise of franchises) {
      row[franchise.name] = franchise.criterionScores[key];
    }
    return row;
  });

  return (
    <ChartShell
      title="Criterion profile"
      summary={`Radar of the eight scoring criteria (0–10) for ${franchises.map((f) => f.name).join(", ")}. The table below carries the exact values.`}
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Criterion</TableHead>
              {franchises.map((f) => (
                <TableHead key={f.slug} className="text-right">
                  {f.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {CRITERION_KEYS.map((key) => (
              <TableRow key={key}>
                <TableCell>{CRITERION_LABELS[key]}</TableCell>
                {franchises.map((f) => (
                  <TableCell key={f.slug} className="text-right tnum">
                    {f.criterionScores[key].toFixed(1)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 12, right: 36, bottom: 12, left: 36 }}>
            <PolarGrid stroke={CHART_STYLE.grid} />
            <PolarAngleAxis dataKey="criterion" tick={{ ...CHART_STYLE.tick, fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 10]} tick={CHART_STYLE.tick} stroke={CHART_STYLE.grid} />
            <Tooltip contentStyle={CHART_STYLE.tooltip} />
            {franchises.map((franchise, index) => (
              <Radar
                key={franchise.slug}
                name={franchise.name}
                dataKey={franchise.name}
                stroke={SERIES_COLORS[index]}
                fill={SERIES_COLORS[index]}
                fillOpacity={franchises.length > 1 ? 0.08 : 0.2}
                strokeWidth={2}
                isAnimationActive={false}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      {franchises.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground" aria-hidden>
          {franchises.map((franchise, index) => (
            <span key={franchise.slug} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-0.5 w-4 rounded"
                style={{ backgroundColor: SERIES_COLORS[index] }}
              />
              {franchise.name}
            </span>
          ))}
        </div>
      )}
    </ChartShell>
  );
}
