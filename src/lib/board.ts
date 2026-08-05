import { z } from "zod";

/**
 * Developer Board intake. The site is static (GitHub Pages), so
 * submissions are filed as GitHub issues on the repository via a
 * prefilled issue URL — no backend required, and every submission lands
 * where the research team can triage it.
 */

export const INTAKE_REPO = "ricksimpson-arch/Newsletter-Project";

export const submissionSchema = z.object({
  gameName: z.string().trim().min(1, "Game name is required").max(120),
  studioName: z.string().trim().min(1, "Studio name is required").max(120),
  website: z
    .string()
    .trim()
    .url("Enter a full URL (https://…)")
    .max(300)
    .or(z.literal("")),
  pitch: z
    .string()
    .trim()
    .min(30, "Tell us a little more — at least 30 characters")
    .max(2000),
  merchAngle: z.string().trim().max(1000).or(z.literal("")),
  contact: z.string().trim().min(1, "A contact (email or social handle) is required").max(200),
});

export type BoardSubmission = z.infer<typeof submissionSchema>;

/** Builds the prefilled GitHub issue URL for a submission. */
export function buildIssueUrl(submission: BoardSubmission): string {
  const title = `[Dev Board] Rating request: ${submission.gameName} (${submission.studioName})`;
  const body = [
    "## Developer Board submission",
    "",
    `**Game:** ${submission.gameName}`,
    `**Studio:** ${submission.studioName}`,
    submission.website ? `**Website:** ${submission.website}` : "**Website:** (none provided)",
    `**Contact:** ${submission.contact}`,
    "",
    "### Pitch",
    submission.pitch,
    ...(submission.merchAngle ? ["", "### Merch angle", submission.merchAngle] : []),
    "",
    "---",
    "_Submitted via the LootSignal Developer Board. Review checklist: verify the studio, assess IP ownership, score the eight criteria, and add a listing to `src/data/boardListings.ts` via PR._",
  ].join("\n");

  const params = new URLSearchParams({ title, body, labels: "dev-board" });
  return `https://github.com/${INTAKE_REPO}/issues/new?${params.toString()}`;
}

/** Plain-text version of a submission, for copy/paste fallback. */
export function submissionToMarkdown(submission: BoardSubmission): string {
  return [
    `Rating request: ${submission.gameName} (${submission.studioName})`,
    submission.website ? `Website: ${submission.website}` : null,
    `Contact: ${submission.contact}`,
    "",
    submission.pitch,
    submission.merchAngle ? `\nMerch angle: ${submission.merchAngle}` : null,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}
