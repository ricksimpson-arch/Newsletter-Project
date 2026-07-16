import * as React from "react";

import { InfoTip } from "@/components/info-tip";
import { productCategories } from "@/data/productCategories";
import type { Franchise } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Category-fit heatmap: rows = franchises, columns = the 14 categories,
 * cells = 1–5 opportunity. Sequential single-hue scale with the value
 * printed in every cell (never color alone); tooltips are keyboard-
 * reachable buttons.
 */
const CELL_SHADES = [
  "bg-chart-1/5 text-muted-foreground",
  "bg-chart-1/15 text-foreground",
  "bg-chart-1/30 text-foreground",
  "bg-chart-1/55 text-white dark:text-background",
  "bg-chart-1/85 text-white dark:text-background",
];

export function CategoryHeatmap({
  franchises,
  caption,
}: {
  franchises: Franchise[];
  caption: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-separate border-spacing-0.5 text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 bg-background p-1.5 text-left font-medium">
              Franchise
            </th>
            {productCategories.map((category) => (
              <th
                scope="col"
                key={category.id}
                className="p-1.5 text-center align-bottom font-medium text-muted-foreground"
              >
                <span className="inline-block max-w-16 whitespace-normal leading-tight">
                  {category.name}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {franchises.map((franchise) => (
            <tr key={franchise.slug}>
              <th
                scope="row"
                className="sticky left-0 z-10 bg-background p-1.5 text-left font-medium whitespace-nowrap"
              >
                {franchise.name}
              </th>
              {productCategories.map((category) => {
                const assessment = franchise.productAssessments.find(
                  (a) => a.categoryId === category.id
                );
                const score = assessment?.opportunity ?? 1;
                return (
                  <td key={category.id} className="p-0 text-center">
                    <InfoTip
                      label={`${franchise.name} × ${category.name}: opportunity ${score} of 5`}
                      className={cn(
                        "size-full min-h-8 w-full rounded-sm tnum text-xs font-medium",
                        CELL_SHADES[score - 1]
                      )}
                    >
                      <p className="font-semibold">
                        {franchise.name} × {category.name}
                      </p>
                      <p className="mt-1 tnum">Opportunity: {score} / 5</p>
                      {assessment && (
                        <>
                          <p className="tnum text-muted-foreground">
                            Margin {assessment.marginPotential}/5 · competition {assessment.competition}/5 · MOQ risk {assessment.moqRisk}/5
                          </p>
                          <p className="mt-1 text-muted-foreground">{assessment.recommendation}</p>
                        </>
                      )}
                    </InfoTip>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-muted-foreground" aria-hidden>
        Cell scale: 1 (avoid) → 5 (lead category). Values are printed in each cell; select a cell
        for the full assessment.
      </p>
    </div>
  );
}
