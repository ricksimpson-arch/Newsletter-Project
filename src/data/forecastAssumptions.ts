import { z } from "zod";

import { catalystSchema } from "@/lib/schemas";
import type { Catalyst } from "@/lib/types";

/**
 * Shared catalyst registry. Catalysts are deliberately generic where a
 * specific event is not verifiable from the seed research: unconfirmed
 * entries are scenario assumptions, never presented as announced facts.
 */
const RAW_CATALYSTS: Catalyst[] = [
  {
    id: "live-service-cadence",
    label: "Live-service content cadence",
    type: "live-service",
    confirmed: true,
    note: "Ongoing operations keep community identity and slogans in circulation; engagement is volatile by nature.",
  },
  {
    id: "tv-adaptation-momentum",
    label: "Television adaptation momentum",
    type: "media",
    confirmed: true,
    note: "An active TV adaptation keeps the franchise in mainstream conversation beyond the player base.",
  },
  {
    id: "transmedia-presence",
    label: "Broad transmedia presence",
    type: "media",
    confirmed: true,
    note: "Film/TV/comics presence sustains awareness independent of game releases.",
  },
  {
    id: "automotive-collaborations",
    label: "Automotive lifestyle collaborations",
    type: "media",
    confirmed: true,
    note: "Official collaborations with automotive brands demonstrated demand for lifestyle products.",
  },
  {
    id: "anniversary-program",
    label: "Franchise anniversary program",
    type: "anniversary",
    confirmed: true,
    note: "Publisher-run anniversary programs create merchandising windows.",
  },
  {
    id: "unconfirmed-mainline-release",
    label: "Potential next mainline release",
    type: "release",
    confirmed: false,
    expectedWindow: "Within 24 months (scenario assumption)",
    note: "Treated purely as a scenario assumption; no release is confirmed in the seed research.",
  },
  {
    id: "yotei-release-momentum",
    label: "Ghost of Yōtei release momentum",
    type: "release",
    confirmed: true,
    expectedWindow: "Active — released October 2, 2025",
    note: "Ghost of Yōtei passed 3.3M units in its first month (Sony FY25 Q2 earnings), outperforming Tsushima's same-period sales; the Legends co-op mode (announced Feb 2026) extends the window.",
  },
  {
    id: "ds2-release-momentum",
    label: "Death Stranding 2 release momentum",
    type: "release",
    confirmed: true,
    expectedWindow: "Active — released June 2025; PC release planned for 2026",
    note: "Death Stranding 2: On the Beach shipped on PS5 in June 2025; the planned 2026 PC release broadens the addressable fan base.",
  },
  {
    id: "q4-gifting",
    label: "Q4 holiday gifting peak",
    type: "seasonal",
    confirmed: true,
    expectedWindow: "October–December, recurring",
    note: "Seasonal demand uplift for giftable and family-safe products.",
  },
];

export const catalysts: Catalyst[] = z.array(catalystSchema).parse(RAW_CATALYSTS);
export const catalystById = new Map(catalysts.map((c) => [c.id, c]));

/**
 * Recommended first-wave allocation. This is an editable strategic
 * scenario for planning discussion — not a guarantee of returns.
 */
export interface AllocationSlice {
  label: string;
  slug: string | null;
  percent: number;
}

export const firstWaveAllocation: AllocationSlice[] = [
  { label: "Helldivers 2", slug: "helldivers-2", percent: 25 },
  { label: "Ghost of Tsushima", slug: "ghost-of-tsushima", percent: 20 },
  { label: "Astro Bot", slug: "astro-bot", percent: 15 },
  { label: "God of War", slug: "god-of-war", percent: 15 },
  { label: "Horizon", slug: "horizon", percent: 10 },
  { label: "The Last of Us", slug: "the-last-of-us", percent: 5 },
  { label: "Bloodborne", slug: "bloodborne", percent: 5 },
  { label: "Exploratory / benchmark tests", slug: null, percent: 5 },
];

/** Default assumption lines attached to every forecast horizon. */
export const BASE_FORECAST_ASSUMPTIONS: Record<6 | 12 | 24, string[]> = {
  6: [
    "Licensing conversations progress on typical small-licensee timelines.",
    "No major franchise reputation events occur.",
  ],
  12: [
    "Catalyst assumptions land within the stated windows.",
    "Merchandise market conditions remain comparable to the research window.",
  ],
  24: [
    "Trend-led gains partially decay without new activations.",
    "Structural drags (saturation, staleness) compound beyond month 12.",
  ],
};
