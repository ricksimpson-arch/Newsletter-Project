import { describe, expect, it } from "vitest";

import { escapeCsvValue, toCsv } from "@/lib/csv";

describe("escapeCsvValue", () => {
  it("passes plain values through", () => {
    expect(escapeCsvValue("Helldivers 2")).toBe("Helldivers 2");
    expect(escapeCsvValue(86)).toBe("86");
  });

  it("quotes values containing commas, quotes, or newlines", () => {
    expect(escapeCsvValue("Like a Dragon, Yakuza")).toBe('"Like a Dragon, Yakuza"');
    expect(escapeCsvValue('He said "hi"')).toBe('"He said ""hi"""');
    expect(escapeCsvValue("line1\nline2")).toBe('"line1\nline2"');
  });

  it("renders null/undefined as empty", () => {
    expect(escapeCsvValue(null)).toBe("");
    expect(escapeCsvValue(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("joins headers and rows with CRLF", () => {
    const csv = toCsv(["name", "score"], [["Astro Bot", 83.5], ["Horizon", 83.2]]);
    expect(csv).toBe("name,score\r\nAstro Bot,83.5\r\nHorizon,83.2");
  });
});
