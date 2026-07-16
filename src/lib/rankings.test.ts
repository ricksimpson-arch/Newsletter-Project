import { describe, expect, it } from "vitest";

import { franchises } from "@/data/franchises";
import { DEFAULT_FILTER, filterFranchises, sortFranchises } from "@/lib/rankings";

describe("filterFranchises", () => {
  it("returns everything under the default filter", () => {
    expect(filterFranchises(franchises, DEFAULT_FILTER)).toHaveLength(50);
  });

  it("searches by name, case-insensitively", () => {
    const result = filterFranchises(franchises, { ...DEFAULT_FILTER, q: "hell" });
    expect(result.map((f) => f.slug)).toEqual(["helldivers-2"]);
  });

  it("filters the Sony family (everything except non-Sony)", () => {
    const result = filterFranchises(franchises, { ...DEFAULT_FILTER, ownership: "sony-family" });
    expect(result.length).toBe(50 - franchises.filter((f) => f.ownershipType === "non-sony").length);
    expect(result.every((f) => f.ownershipType !== "non-sony")).toBe(true);
  });

  it("filters by score band", () => {
    const result = filterFranchises(franchises, { ...DEFAULT_FILTER, band: "85+" });
    expect(result.map((f) => f.slug).sort()).toEqual(["ghost-of-tsushima", "god-of-war", "helldivers-2"]);
  });

  it("filters by best category", () => {
    const result = filterFranchises(franchises, { ...DEFAULT_FILTER, category: "plush" });
    expect(result.every((f) => f.bestCategories.includes("plush"))).toBe(true);
    expect(result.map((f) => f.slug)).toContain("astro-bot");
  });

  it("filters by licensing complexity bucket", () => {
    const high = filterFranchises(franchises, { ...DEFAULT_FILTER, licensing: "high" });
    expect(high.every((f) => f.licensingComplexity >= 7)).toBe(true);
    expect(high.map((f) => f.slug)).toContain("marvels-spider-man");
  });

  it("restricts to the top N default ranks", () => {
    const result = filterFranchises(franchises, { ...DEFAULT_FILTER, top: "10" });
    expect(result).toHaveLength(10);
    expect(Math.max(...result.map((f) => f.rank))).toBe(10);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterFranchises(franchises, { ...DEFAULT_FILTER, q: "zzzz" })).toHaveLength(0);
  });
});

describe("sortFranchises", () => {
  it("sorts by any numeric column in both directions", () => {
    const desc = sortFranchises(franchises, "momentum", "desc");
    expect(desc[0].slug).toBe("helldivers-2");
    const asc = sortFranchises(franchises, "momentum", "asc");
    expect(asc[0].criterionScores.momentum).toBeLessThanOrEqual(
      asc[1].criterionScores.momentum
    );
  });

  it("sorts by name alphabetically", () => {
    const sorted = sortFranchises(franchises, "name", "asc");
    const names = sorted.map((f) => f.name.toLowerCase());
    expect(names).toEqual([...names].sort());
  });

  it("breaks ties by default rank (Horizon before The Last of Us at 83.2)", () => {
    const sorted = sortFranchises(franchises, "overallScore", "desc");
    const horizonIndex = sorted.findIndex((f) => f.slug === "horizon");
    const tlouIndex = sorted.findIndex((f) => f.slug === "the-last-of-us");
    expect(horizonIndex).toBeLessThan(tlouIndex);
  });

  it("does not mutate the input array", () => {
    const original = [...franchises];
    sortFranchises(franchises, "name", "desc");
    expect(franchises).toEqual(original);
  });
});
