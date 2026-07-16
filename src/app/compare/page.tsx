import type { Metadata } from "next";
import { Suspense } from "react";

import { CompareView } from "@/components/compare/compare-view";
import { Skeleton } from "@/components/ui/skeleton";
import { franchises } from "@/data/franchises";

export const metadata: Metadata = {
  title: "Compare Franchises",
  description: "Side-by-side comparison of up to four franchises across scores, criteria, categories, and forecasts.",
};

export default function ComparePage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Compare</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Up to four franchises side by side. The recommendation summary is generated
          deterministically from the research data.
        </p>
      </header>
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CompareView franchises={franchises} />
      </Suspense>
    </div>
  );
}
