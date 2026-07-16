import type { Metadata } from "next";

import { ForecastLab } from "@/components/forecast/forecast-lab";
import { franchises } from "@/data/franchises";

export const metadata: Metadata = {
  title: "Forecast Lab",
  description:
    "Reweight the scoring model, adjust scenario assumptions, and see rankings, allocations, and category recommendations recalculate instantly.",
};

export default function ForecastPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Forecast Lab</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Reweight the model, set scenario assumptions, and watch the ranking recalculate
          instantly. Export scenarios as JSON to share, or save them locally.
        </p>
      </header>
      <ForecastLab franchises={franchises} />
    </div>
  );
}
