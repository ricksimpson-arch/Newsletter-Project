"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_STYLE, ChartShell } from "@/components/charts/chart-shell";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const SERIES_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export interface GroupedBarSeries {
  name: string;
  values: Record<string, number>;
}

/** Grouped horizontal bars comparing 2–4 entities across metrics. */
export default function GroupedBars({
  title,
  summary,
  metrics,
  series,
  max = 100,
}: {
  title: string;
  summary: string;
  metrics: string[];
  series: GroupedBarSeries[];
  max?: number;
}) {
  const data = metrics.map((metric) => {
    const row: Record<string, string | number> = { metric };
    for (const s of series) row[s.name] = s.values[metric] ?? 0;
    return row;
  });

  return (
    <ChartShell
      title={title}
      summary={summary}
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              {series.map((s) => (
                <TableHead key={s.name} className="text-right">
                  {s.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric}>
                <TableCell>{metric}</TableCell>
                {series.map((s) => (
                  <TableCell key={s.name} className="text-right tnum">
                    {(s.values[metric] ?? 0).toFixed(1)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <div style={{ height: Math.max(220, metrics.length * (series.length * 18 + 26)) }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 4, bottom: 4 }}>
            <CartesianGrid stroke={CHART_STYLE.grid} strokeDasharray="2 4" horizontal={false} />
            <XAxis type="number" domain={[0, max]} tick={CHART_STYLE.tick} stroke={CHART_STYLE.grid} />
            <YAxis
              type="category"
              dataKey="metric"
              width={140}
              tick={{ ...CHART_STYLE.tick, fontSize: 10 }}
              stroke={CHART_STYLE.grid}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={CHART_STYLE.tooltip}
              formatter={(value, name) => [Number(value).toFixed(1), String(name)]}
            />
            {series.map((s, index) => (
              <Bar
                key={s.name}
                dataKey={s.name}
                fill={SERIES_COLORS[index]}
                barSize={12}
                radius={[0, 3, 3, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground" aria-hidden>
        {series.map((s, index) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: SERIES_COLORS[index] }} />
            {s.name}
          </span>
        ))}
      </div>
    </ChartShell>
  );
}
