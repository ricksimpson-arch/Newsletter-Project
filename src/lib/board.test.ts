import { describe, expect, it } from "vitest";

import { buildIssueUrl, submissionSchema, submissionToMarkdown } from "@/lib/board";

const VALID = {
  gameName: "Cosmic Diner",
  studioName: "Tiny Fork Studio",
  website: "https://tinyfork.example",
  pitch: "A co-op cooking roguelike where every customer is an alien with strong opinions about soup.",
  merchAngle: "The soup aliens are plush-ready.",
  contact: "dev@tinyfork.example",
};

describe("submissionSchema", () => {
  it("accepts a valid submission", () => {
    expect(submissionSchema.safeParse(VALID).success).toBe(true);
  });

  it("allows empty optional fields but rejects missing required ones", () => {
    expect(submissionSchema.safeParse({ ...VALID, website: "", merchAngle: "" }).success).toBe(true);
    expect(submissionSchema.safeParse({ ...VALID, gameName: "" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...VALID, contact: "" }).success).toBe(false);
    expect(submissionSchema.safeParse({ ...VALID, pitch: "too short" }).success).toBe(false);
  });

  it("rejects malformed websites", () => {
    expect(submissionSchema.safeParse({ ...VALID, website: "not a url" }).success).toBe(false);
  });
});

describe("buildIssueUrl", () => {
  it("targets the intake repository's new-issue endpoint with the dev-board label", () => {
    const url = new URL(buildIssueUrl(VALID));
    expect(url.origin + url.pathname).toBe(
      "https://github.com/ricksimpson-arch/Newsletter-Project/issues/new"
    );
    expect(url.searchParams.get("labels")).toBe("dev-board");
  });

  it("prefills title and body with the submission details", () => {
    const url = new URL(buildIssueUrl(VALID));
    expect(url.searchParams.get("title")).toBe(
      "[Dev Board] Rating request: Cosmic Diner (Tiny Fork Studio)"
    );
    const body = url.searchParams.get("body") ?? "";
    expect(body).toContain("**Studio:** Tiny Fork Studio");
    expect(body).toContain(VALID.pitch);
    expect(body).toContain("### Merch angle");
  });

  it("handles missing optional fields", () => {
    const body = new URL(buildIssueUrl({ ...VALID, website: "", merchAngle: "" })).searchParams.get(
      "body"
    )!;
    expect(body).toContain("**Website:** (none provided)");
    expect(body).not.toContain("### Merch angle");
  });
});

describe("submissionToMarkdown", () => {
  it("renders a copy/paste-ready plain-text version", () => {
    const text = submissionToMarkdown(VALID);
    expect(text).toContain("Rating request: Cosmic Diner (Tiny Fork Studio)");
    expect(text).toContain("Contact: dev@tinyfork.example");
    expect(text).toContain("Merch angle: The soup aliens are plush-ready.");
  });
});
