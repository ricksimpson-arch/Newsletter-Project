import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Wraps every chart with an accessible text summary and a data-table
 * alternative, so no information is available through the graphic alone.
 */
export function ChartShell({
  title,
  summary,
  table,
  children,
  className,
}: {
  title: string;
  /** One-sentence text description of what the chart shows. */
  summary: string;
  /** Accessible data-table alternative for the chart. */
  table: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <figure className={cn("min-w-0", className)}>
      <div role="img" aria-label={`${title}. ${summary}`}>
        {children}
      </div>
      <figcaption className="mt-2 text-xs text-muted-foreground">{summary}</figcaption>
      <details className="mt-2">
        <summary className="cursor-pointer rounded text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
          View as data table
        </summary>
        <div className="mt-2 overflow-x-auto">{table}</div>
      </details>
    </figure>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <output
      aria-label="Chart loading"
      className="flex w-full animate-pulse items-center justify-center rounded-lg bg-muted/60 text-xs text-muted-foreground"
      style={{ height }}
    >
      Loading chart…
    </output>
  );
}

/** Shared recessive styling values for Recharts primitives. */
export const CHART_STYLE = {
  tick: { fill: "var(--muted-foreground)", fontSize: 11 },
  grid: "var(--border)",
  tooltip: {
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--popover-foreground)",
    fontSize: 12,
  },
} as const;
