import { describe, expect, it } from "vitest";

import { franchiseBySlug } from "@/data/franchises";
import { generateComparisonSummary } from "@/lib/compare";

const got = franchiseBySlug.get("ghost-of-tsushima")!;
const astro = franchiseBySlug.get("astro-bot")!;
const spiderMan = franchiseBySlug.get("marvels-spider-man")!;

describe("generateComparisonSummary", () => {
  it("returns nothing for fewer than two franchises", () => {
    expect(generateComparisonSummary([])).toEqual([]);
    expect(generateComparisonSummary([got])).toEqual([]);
  });

  it("is deterministic for the same input", () => {
    const a = generateComparisonSummary([got, astro]);
    const b = generateComparisonSummary([got, astro]);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(1);
  });

  it("leads with the higher-actionability franchise and names both", () => {
    const summary = generateComparisonSummary([astro, got]);
    expect(summary[0]).toContain("Ghost of Tsushima");
    expect(summary[0]).toContain("Astro Bot");
    expect(summary[0].indexOf("Ghost of Tsushima")).toBeLessThan(summary[0].indexOf("Astro Bot"));
  });

  it("calls out the hardest licensing path", () => {
    const summary = generateComparisonSummary([got, spiderMan]).join(" ");
    expect(summary).toContain("Marvel's Spider-Man");
    expect(summary).toMatch(/rights|licensing/i);
  });
});
