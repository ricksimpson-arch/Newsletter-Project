import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleHelpIcon,
  CircleMinusIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  MoveRightIcon,
} from "lucide-react";

import {
  CONFIDENCE_BAND_LABELS,
  confidenceBand,
  recommendationLabel,
} from "@/lib/scoring";
import { FRESHNESS_LABELS } from "@/lib/freshness";
import type {
  ForecastDirection,
} from "@/lib/forecast";
import { FORECAST_DIRECTION_LABELS } from "@/lib/forecast";
import type { FreshnessStatus, OwnershipType, RecommendationLevel, SourceTier } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Recommendation bands each get a distinct treatment (color + text — the
 * label is always written out, never color alone).
 */
const REC_STYLES: Record<RecommendationLevel, string> = {
  priority: "border-chart-1/50 bg-chart-1/15 text-foreground",
  "strong-pursuit": "border-chart-4/50 bg-chart-4/15 text-foreground",
  "selective-pursuit": "border-chart-3/50 bg-chart-3/15 text-foreground",
  "test-or-monitor": "border-chart-2/50 bg-chart-2/15 text-foreground",
  "niche-only": "border-border bg-muted text-muted-foreground",
  deprioritize: "border-warning-risk/50 bg-warning-risk/10 text-foreground",
};

/** Chart series colors per recommendation level (CSS variables). */
export const REC_CHART_COLORS: Record<RecommendationLevel, string> = {
  priority: "var(--chart-1)",
  "strong-pursuit": "var(--chart-4)",
  "selective-pursuit": "var(--chart-3)",
  "test-or-monitor": "var(--chart-2)",
  "niche-only": "var(--muted-foreground)",
  deprioritize: "var(--warning-risk)",
};

export function RecommendationBadge({
  level,
  className,
}: {
  level: RecommendationLevel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        REC_STYLES[level],
        className
      )}
    >
      {recommendationLabel(level)}
    </span>
  );
}

/** Confidence: text + icon + number — never color alone. */
export function ConfidenceIndicator({
  score,
  compact = false,
  className,
}: {
  score: number;
  compact?: boolean;
  className?: string;
}) {
  const band = confidenceBand(score);
  const Icon =
    band === "high" ? CircleCheckIcon : band === "medium" ? CircleMinusIcon : CircleAlertIcon;
  const color =
    band === "high" ? "text-favorable" : band === "medium" ? "text-opportunity" : "text-warning-risk";
  const label = CONFIDENCE_BAND_LABELS[band];
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-xs font-medium tnum", className)}
      title={`${label}: ${Math.round(score)}/100`}
    >
      <Icon aria-hidden className={cn("size-3.5 shrink-0", color)} />
      <span>
        {compact ? band.charAt(0).toUpperCase() + band.slice(1) : label} · {Math.round(score)}
      </span>
    </span>
  );
}

const TIER_META: Record<SourceTier, { label: string; long: string; className: string }> = {
  "tier-1": {
    label: "T1",
    long: "Tier 1 — official/publisher data",
    className: "border-chart-1/60 bg-chart-1/10",
  },
  "tier-2": {
    label: "T2",
    long: "Tier 2 — industry databases & analytics",
    className: "border-chart-4/60 bg-chart-4/10",
  },
  "tier-3": {
    label: "T3",
    long: "Tier 3 — community/retail/search proxies",
    className: "border-chart-2/60 bg-chart-2/10",
  },
  modeled: {
    label: "Modeled",
    long: "Modeled — internal calculation, not an external source",
    className: "border-dashed border-muted-foreground/60 bg-muted text-muted-foreground",
  },
};

export function SourceTierBadge({ tier, className }: { tier: SourceTier; className?: string }) {
  const meta = TIER_META[tier];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        meta.className,
        className
      )}
      title={meta.long}
    >
      {tier === "modeled" && <CircleDashedIcon aria-hidden className="mr-1 size-3" />}
      {meta.label}
    </span>
  );
}

export function ModeledBadge({ isModeled }: { isModeled: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        isModeled
          ? "border-dashed border-muted-foreground/60 text-muted-foreground"
          : "border-chart-1/60 text-foreground"
      )}
    >
      {isModeled ? "Modeled" : "Observed"}
    </span>
  );
}

const FRESHNESS_STYLES: Record<FreshnessStatus, { icon: typeof CircleCheckIcon; className: string }> = {
  current: { icon: CircleCheckIcon, className: "text-favorable" },
  "review-soon": { icon: CircleMinusIcon, className: "text-opportunity" },
  stale: { icon: CircleAlertIcon, className: "text-warning-risk" },
  unknown: { icon: CircleHelpIcon, className: "text-muted-foreground" },
};

export function FreshnessBadge({ status }: { status: FreshnessStatus }) {
  const { icon: Icon, className } = FRESHNESS_STYLES[status];
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <Icon aria-hidden className={cn("size-3.5", className)} />
      {FRESHNESS_LABELS[status]}
    </span>
  );
}

export const OWNERSHIP_LABELS: Record<OwnershipType, string> = {
  "sony-owned": "Sony-owned",
  "playstation-led": "PlayStation-led",
  "sony-partner": "Sony partner",
  "non-sony": "Non-Sony",
  legacy: "Sony legacy",
};

export function OwnershipBadge({ type, className }: { type: OwnershipType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs whitespace-nowrap",
        type === "non-sony"
          ? "border-dashed text-muted-foreground"
          : "border-border bg-secondary text-secondary-foreground",
        className
      )}
    >
      {OWNERSHIP_LABELS[type]}
    </span>
  );
}

export function DirectionIndicator({ direction }: { direction: ForecastDirection }) {
  const Icon =
    direction === "improving"
      ? TrendingUpIcon
      : direction === "softening"
        ? TrendingDownIcon
        : MoveRightIcon;
  const color =
    direction === "improving"
      ? "text-favorable"
      : direction === "softening"
        ? "text-warning-risk"
        : "text-muted-foreground";
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      <Icon aria-hidden className={cn("size-3.5", color)} />
      {FORECAST_DIRECTION_LABELS[direction]}
    </span>
  );
}

/** Displays a metric value, rendering null as “Not publicly reported”. */
export function MetricValue({ value, unit }: { value: number | string | null; unit?: string }) {
  if (value === null) {
    return <span className="italic text-muted-foreground">Not publicly reported</span>;
  }
  if (typeof value === "number") {
    return (
      <span className="tnum font-medium">
        {value.toLocaleString("en-US")}
        {unit ? <span className="ml-1 text-xs text-muted-foreground">{unit}</span> : null}
      </span>
    );
  }
  return <span>{value}</span>;
}
