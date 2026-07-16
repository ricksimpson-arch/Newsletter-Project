import { describe, expect, it } from "vitest";

import { daysBetween, freshnessStatus } from "@/lib/freshness";

describe("freshnessStatus", () => {
  const ref = "2026-07-10";

  it("classifies recent dates as current", () => {
    expect(freshnessStatus("2026-06-01", ref)).toBe("current");
  });

  it("classifies 6–12 month old dates as review-soon", () => {
    expect(freshnessStatus("2025-11-20", ref)).toBe("review-soon");
  });

  it("classifies >12 month old dates as stale", () => {
    expect(freshnessStatus("2025-05-15", ref)).toBe("stale");
  });

  it("classifies missing or invalid dates as unknown", () => {
    expect(freshnessStatus(undefined, ref)).toBe("unknown");
    expect(freshnessStatus("not-a-date", ref)).toBe("unknown");
  });
});

describe("daysBetween", () => {
  it("computes whole-day differences", () => {
    expect(daysBetween("2026-07-01", "2026-07-10")).toBe(9);
  });
});
