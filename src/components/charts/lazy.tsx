"use client";

import dynamic from "next/dynamic";

import { ChartSkeleton } from "@/components/charts/chart-shell";

/**
 * Chart components are heavy (Recharts); they load lazily on the client
 * with skeleton placeholders and are excluded from SSR.
 */
export const LazyTop10Bar = dynamic(() => import("@/components/charts/top10-bar"), {
  ssr: false,
  loading: () => <ChartSkeleton height={340} />,
});

export const LazyQuadrantChart = dynamic(() => import("@/components/charts/quadrant-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={420} />,
});

export const LazyCriteriaRadar = dynamic(() => import("@/components/charts/criteria-radar"), {
  ssr: false,
  loading: () => <ChartSkeleton height={320} />,
});

export const LazyContributionChart = dynamic(
  () => import("@/components/charts/contribution-chart"),
  { ssr: false, loading: () => <ChartSkeleton height={320} /> }
);

export const LazyForecastChart = dynamic(() => import("@/components/charts/forecast-chart"), {
  ssr: false,
  loading: () => <ChartSkeleton height={300} />,
});

export const LazyGroupedBars = dynamic(() => import("@/components/charts/grouped-bars"), {
  ssr: false,
  loading: () => <ChartSkeleton height={260} />,
});
