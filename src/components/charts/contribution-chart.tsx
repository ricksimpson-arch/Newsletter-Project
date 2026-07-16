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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITERION_KEYS, CRITERION_LABELS, CRITERION_WEIGHTS, roundScore } from "@/lib/scoring";
import type { Franchise } from "@/lib/types";

/**
 * Score-contribution waterfall: each criterion's weighted contribution
 * stacks left-to-right into the total. Rendered as offset bars (the
 * classic waterfall construction) plus a total bar.
 */
export default function ContributionChart({ franchise }: { franchise: Franchise }) {
  const contributions = CRITERION_KEYS.map((key) =>
    roundScore(franchise.criterionScores[key] * CRITERION_WEIGHTS[key] * 10, 2)
  );
  const rows = CRITERION_KEYS.map((key, index) => {
    const base = roundScore(
      contributions.slice(0, index).reduce((sum, c) => sum + c, 0),
      2
    );
    return {
      name: CRITERION_LABELS[key],
      base,
      contribution: contributions[index],
      cumulative: roundScore(base + contributions[index], 2),
      weight: CRITERION_WEIGHTS[key],
      raw: franchise.criterionScores[key],
      isTotal: false,
    };
  });
  const total = roundScore(
    contributions.reduce((sum, c) => sum + c, 0),
    2
  );
  const data = [
    ...rows,
    {
      name: "Overall score",
      base: 0,
      contribution: total,
      cumulative: total,
      weight: 1,
      raw: franchise.overallScore,
      isTotal: true,
    },
  ];

  return (
    <ChartShell
      title="Score contribution"
      summary={`How each weighted criterion builds ${franchise.name}'s overall score of ${franchise.overallScore.toFixed(1)}: bars stack cumulatively from brand recognition through whitespace.`}
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Criterion</TableHead>
              <TableHead className="text-right">Score (0–10)</TableHead>
              <TableHead className="text-right">Weight</TableHead>
              <TableHead className="text-right">Contribution</TableHead>
              <TableHead className="text-right">Running total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right tnum">{row.raw.toFixed(1)}</TableCell>
                <TableCell className="text-right tnum">{Math.round(row.weight * 100)}%</TableCell>
                <TableCell className="text-right tnum">+{row.contribution.toFixed(2)}</TableCell>
                <TableCell className="text-right tnum">{row.cumulative.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 48, top: 4, bottom: 4 }}>
            <XAxis type="number" domain={[0, 100]} tick={CHART_STYLE.tick} stroke={CHART_STYLE.grid} />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ ...CHART_STYLE.tick, fontSize: 10 }}
              stroke={CHART_STYLE.grid}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--accent)", opacity: 0.4 }}
              contentStyle={CHART_STYLE.tooltip}
              formatter={(value, name) =>
                name === "contribution" ? [`+${Number(value).toFixed(2)} pts`, "Contribution"] : [null, null]
              }
            />
            {/* invisible offset positions each bar at its running start */}
            <Bar dataKey="base" stackId="waterfall" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="contribution" stackId="waterfall" barSize={16} isAnimationActive={false}>
              {data.map((row) => (
                <Cell
                  key={row.name}
                  fill={row.isTotal ? "var(--chart-3)" : "var(--chart-1)"}
                  radius={2}
                />
              ))}
              <LabelList
                dataKey="contribution"
                position="right"
                formatter={(value) => `+${Number(value).toFixed(1)}`}
                style={{ fill: "var(--muted-foreground)", fontSize: 10, fontVariantNumeric: "tabular-nums" }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartShell>
  );
}
