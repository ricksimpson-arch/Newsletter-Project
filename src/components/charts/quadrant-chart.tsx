"use client";

import {
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { CHART_STYLE, ChartShell } from "@/components/charts/chart-shell";
import { OWNERSHIP_LABELS } from "@/components/indicators";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Franchise } from "@/lib/types";

interface QuadrantDatum {
  name: string;
  x: number;
  y: number;
  z: number;
  confidence: number;
  sony: boolean;
  labeled: boolean;
}

const QUADRANTS = [
  { label: "Strategic Pursuit", x: "low licensing feasibility", y: "high demand", position: { left: "4%", top: "6%" } },
  { label: "Priority Build", x: "manageable licensing", y: "high demand", position: { right: "4%", top: "6%" } },
  { label: "Deprioritize", x: "low licensing feasibility", y: "moderate demand", position: { left: "4%", bottom: "12%" } },
  { label: "Niche Test", x: "manageable licensing", y: "moderate demand", position: { right: "4%", bottom: "12%" } },
];

export default function QuadrantChart({ franchises }: { franchises: Franchise[] }) {
  const labeledSlugs = new Set(
    [...franchises].sort((a, b) => a.rank - b.rank).slice(0, 15).map((f) => f.slug)
  );
  const data: QuadrantDatum[] = franchises.map((f) => ({
    name: f.name,
    x: f.criterionScores.licensingFeasibility,
    y: f.rawDemandScore,
    z: f.overallScore,
    confidence: f.confidenceScore,
    sony: f.ownershipType !== "non-sony",
    labeled: labeledSlugs.has(f.slug),
  }));

  const yMid = 72;

  return (
    <ChartShell
      title="Opportunity vs friction quadrant"
      summary="Each bubble is a franchise: licensing feasibility (x, higher is easier), raw demand (y), bubble size = overall score, opacity = confidence. Solid outline = Sony/PlayStation-led, dashed legend entry = non-Sony. Top 15 are labeled."
      table={
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Franchise</TableHead>
              <TableHead className="text-right">Licensing feasibility</TableHead>
              <TableHead className="text-right">Raw demand</TableHead>
              <TableHead className="text-right">Overall</TableHead>
              <TableHead className="text-right">Confidence</TableHead>
              <TableHead>Ownership</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.name}>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right tnum">{row.x.toFixed(1)}</TableCell>
                <TableCell className="text-right tnum">{row.y.toFixed(1)}</TableCell>
                <TableCell className="text-right tnum">{row.z.toFixed(1)}</TableCell>
                <TableCell className="text-right tnum">{Math.round(row.confidence)}</TableCell>
                <TableCell>{row.sony ? "Sony / PlayStation-led" : "Non-Sony"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    >
      <div className="relative h-[420px] w-full">
        {QUADRANTS.map((q) => (
          <span
            key={q.label}
            aria-hidden
            className="pointer-events-none absolute z-10 rounded bg-background/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
            style={q.position}
          >
            {q.label}
          </span>
        ))}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 24, right: 24, bottom: 8, left: 8 }}>
            <CartesianGrid stroke={CHART_STYLE.grid} strokeDasharray="2 4" />
            <XAxis
              type="number"
              dataKey="x"
              name="Licensing feasibility"
              domain={[0, 10]}
              tick={CHART_STYLE.tick}
              stroke={CHART_STYLE.grid}
              label={{
                value: "Licensing feasibility →",
                position: "insideBottom",
                offset: -2,
                style: { fill: "var(--muted-foreground)", fontSize: 11 },
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Raw demand"
              domain={[50, 100]}
              tick={CHART_STYLE.tick}
              stroke={CHART_STYLE.grid}
              label={{
                value: "Raw demand →",
                angle: -90,
                position: "insideLeft",
                style: { fill: "var(--muted-foreground)", fontSize: 11 },
              }}
            />
            <ZAxis type="number" dataKey="z" range={[60, 420]} name="Overall score" />
            <ReferenceLine x={5} stroke={CHART_STYLE.grid} />
            <ReferenceLine y={yMid} stroke={CHART_STYLE.grid} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3", stroke: "var(--muted-foreground)" }}
              contentStyle={CHART_STYLE.tooltip}
              formatter={(value, name) => [
                typeof value === "number" ? value.toFixed(1) : value,
                name,
              ]}
              labelFormatter={() => ""}
              content={({ payload }) => {
                const p = payload?.[0]?.payload as QuadrantDatum | undefined;
                if (!p) return null;
                return (
                  <div style={CHART_STYLE.tooltip} className="p-2">
                    <p className="font-semibold">{p.name}</p>
                    <p className="tnum">Licensing feasibility {p.x.toFixed(1)} / 10</p>
                    <p className="tnum">Raw demand {p.y.toFixed(1)} / 100</p>
                    <p className="tnum">Overall {p.z.toFixed(1)} · confidence {Math.round(p.confidence)}</p>
                    <p>{p.sony ? "Sony / PlayStation-led" : "Non-Sony"}</p>
                  </div>
                );
              }}
            />
            <Scatter data={data} isAnimationActive={false}>
              {data.map((row) => (
                <Cell
                  key={row.name}
                  fill="var(--chart-1)"
                  fillOpacity={Math.max(0.3, row.confidence / 100)}
                  stroke={row.sony ? "var(--chart-1)" : "var(--foreground)"}
                  strokeDasharray={row.sony ? undefined : "3 2"}
                  strokeWidth={1.5}
                />
              ))}
              <LabelList
                dataKey="name"
                position="top"
                content={(props) => {
                  const { x, y, value, index } = props as {
                    x?: number;
                    y?: number;
                    value?: string;
                    index?: number;
                  };
                  const row = typeof index === "number" ? data[index] : undefined;
                  if (!row?.labeled || x === undefined || y === undefined) return null;
                  // Alternate labels above/below the bubble to reduce
                  // collisions in the dense top-right cluster.
                  const below = (index ?? 0) % 2 === 1;
                  return (
                    <text
                      x={x}
                      y={below ? (y ?? 0) + 18 : (y ?? 0) - 10}
                      textAnchor="middle"
                      style={{ fill: "var(--foreground)", fontSize: 10, paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 3 }}
                    >
                      {value}
                    </text>
                  );
                }}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground" aria-hidden>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full border-2" style={{ borderColor: "var(--chart-1)", backgroundColor: "var(--chart-1)", opacity: 0.7 }} />
          Sony / PlayStation-led
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full border-2 border-dashed" style={{ borderColor: "var(--foreground)", backgroundColor: "var(--chart-1)", opacity: 0.7 }} />
          {OWNERSHIP_LABELS["non-sony"]}
        </span>
        <span>Bubble size = overall score · opacity = confidence</span>
      </div>
    </ChartShell>
  );
}
