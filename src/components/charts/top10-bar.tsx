"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CHART_STYLE, ChartShell } from "@/components/charts/chart-shell";
import { REC_CHART_COLORS, RecommendationBadge } from "@/components/indicators";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { recommendationLabel } from "@/lib/scoring";
import type { Franchise } from "@/lib/types";

export default function Top10Bar({ franchises }: { franchises: Franchise[] }) {
  const data = franchises.map((f) => ({
    name: f.name,
    score: f.overallScore,
    recommendation: f.recommendation,
  }));
  const levels = [...new Set(franchises.map((f) => f.recommendation))];

  return (
    <ChartShell
      title="Top 10 opportunity scores"
      summary={`Horizontal bars of the top ${franchises.length} actionability scores, colored by recommendation level (${levels.map(recommendationLabel).join(", ")}).`}
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Franchise</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Recommendation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right tnum">{row.score.toFixed(1)}</TableCell>
                <TableCell>
                  <RecommendationBadge level={row.recommendation} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 44, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} tick={CHART_STYLE.tick} stroke={CHART_STYLE.grid} />
            <YAxis
              type="category"
              dataKey="name"
              width={132}
              tick={CHART_STYLE.tick}
              stroke={CHART_STYLE.grid}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={CHART_STYLE.tooltip}
              formatter={(value, _name, item) => [
                `${Number(value).toFixed(1)} · ${recommendationLabel(item?.payload?.recommendation)}`,
                "Score",
              ]}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((row) => (
                <Cell key={row.name} fill={REC_CHART_COLORS[row.recommendation]} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                formatter={(value) => Number(value).toFixed(1)}
                style={{ fill: "var(--foreground)", fontSize: 11, fontVariantNumeric: "tabular-nums" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground" aria-hidden>
        {levels.map((level) => (
          <span key={level} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: REC_CHART_COLORS[level] }}
            />
            {recommendationLabel(level)}
          </span>
        ))}
      </div>
    </ChartShell>
  );
}
