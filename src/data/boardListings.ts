import { z } from "zod";

/**
 * Developer Board listings. LootSignal is a static site, so listings are
 * curated data, not live posts: developers submit via the board's intake
 * form (which files a GitHub issue on this repository), the research
 * team reviews the submission, and accepted listings are added here via
 * pull request. Never add a listing without a real submission behind it.
 */
export const boardListingSchema = z.object({
  id: z.string().min(1),
  gameName: z.string().min(1),
  studioName: z.string().min(1),
  /** Developer's own pitch, quoted as submitted (lightly edited for length). */
  pitch: z.string().min(1),
  website: z.string().url().optional(),
  submittedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["new", "under-review", "rated"]),
  /** Set when a review concludes and the game enters the rankings. */
  rankedSlug: z.string().optional(),
});

export type BoardListing = z.infer<typeof boardListingSchema>;

const RAW_LISTINGS: BoardListing[] = [
  // Listings are added here by PR after a developer submission is
  // reviewed. See the intake form on /board.
];

export const boardListings: BoardListing[] = z.array(boardListingSchema).parse(RAW_LISTINGS);
