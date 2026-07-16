import type { Metadata } from "next";
import { Suspense } from "react";

import { RankingsView } from "@/components/rankings/rankings-view";
import { Skeleton } from "@/components/ui/skeleton";
import { franchises } from "@/data/franchises";

export const metadata: Metadata = {
  title: "Franchise Rankings",
  description:
    "All 50 evaluated franchises ranked by small-company actionability, with filters, search, and CSV export.",
};

export default function RankingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Franchise Rankings</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          All 50 franchises ranked by <strong>small-company actionability</strong> — the weighted
          model that prices in licensing friction, saturation, and operational exposure. Filters
          are shareable via the URL.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <RankingsView franchises={franchises} />
      </Suspense>
    </div>
  );
}
