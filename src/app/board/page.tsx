import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2Icon,
  CircleDotIcon,
  MessagesSquareIcon,
  SearchIcon,
  StoreIcon,
} from "lucide-react";

import { SubmissionForm } from "@/components/board/submission-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { boardListings } from "@/data/boardListings";
import { franchises } from "@/data/franchises";

export const metadata: Metadata = {
  title: "Developer Board",
  description:
    "Game developers: request a LootSignal merchandise-potential rating and tell us about your game.",
};

const STATUS_LABELS = {
  new: "New",
  "under-review": "Under review",
  rated: "Rated",
} as const;

/** The research roadmap this pipeline feeds. */
const ROADMAP = [
  {
    icon: CheckCircle2Icon,
    title: "Define the actual IP owners",
    status: "Shipped",
    body: "Every franchise now shows its real rights holder — Capcom, Square Enix, Disney/Marvel, Kojima Productions, Squanch Games — instead of a generic “Non-Sony” bucket, across rankings, detail pages, and compare.",
  },
  {
    icon: SearchIcon,
    title: "Scout indie creators for the marketplace",
    status: "Ongoing",
    body: "Find independent studios with toyetic IP and approachable rights holders — the Squanch Games profile — and invite them in. High on Life (rank 28) was the first addition; this board is the front door for the next ones.",
  },
  {
    icon: StoreIcon,
    title: "Map licensees for partnership and competition",
    status: "Ongoing",
    body: "Named collectible suppliers now cover the top 10 and all benchmarks (Youtooz, Good Smile, Prime 1, Mondo, …). Next: extend the scan to all 52 franchises and tag each licensee as a partnership candidate or a competitor.",
  },
];

export default function BoardPage() {
  const ratedCount = boardListings.filter((l) => l.status === "rated").length;

  return (
    <div className="space-y-10">
      <header>
        <p className="inline-flex items-center gap-2 rounded-full border border-chart-1/40 bg-chart-1/10 px-3 py-1 text-xs font-medium">
          <MessagesSquareIcon aria-hidden className="size-3.5 text-chart-1" />
          For game developers
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Developer Board</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Built a game with fans who&apos;d wear it? Post a listing, tell us about your game, and
          request a LootSignal rating. Rated games join the{" "}
          <Link href="/rankings" className="text-primary underline-offset-4 hover:underline">
            rankings
          </Link>{" "}
          alongside {franchises.length} franchises — and strong ones get a licensing conversation
          with our merchandise team.
        </p>
      </header>

      {/* How it works */}
      <section aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-lg font-semibold">
          How it works
        </h2>
        <ol className="mt-3 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "1. Post your listing",
              body: "Fill in the form below. Submissions are filed openly on our GitHub repository so the whole pipeline is transparent.",
            },
            {
              step: "2. We rate your game",
              body: "The research team scores the eight criteria — brand, momentum, fandom, visual suitability, licensing, audience, pricing, whitespace — the same model every franchise here gets.",
            },
            {
              step: "3. Your listing goes live",
              body: "Accepted listings appear on this board with their status, and rated games enter the rankings with a full franchise dossier.",
            },
          ].map((item) => (
            <li key={item.step} className="rounded-lg border bg-card p-4">
              <h3 className="text-sm font-semibold">{item.step}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Listings */}
      <section aria-labelledby="listings">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="listings" className="text-lg font-semibold">
            Current listings
          </h2>
          <p className="text-xs text-muted-foreground tnum">
            {boardListings.length} listing{boardListings.length === 1 ? "" : "s"} · {ratedCount}{" "}
            rated
          </p>
        </div>
        {boardListings.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed p-10 text-center">
            <p className="font-medium">No listings yet — the board just opened.</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Be the first: post your game below. Every submission is reviewed by the research
              team, and accepted listings appear here with their rating status.
            </p>
          </div>
        ) : (
          <ul className="mt-3 grid gap-4 md:grid-cols-2">
            {boardListings.map((listing) => (
              <li key={listing.id}>
                <Card className="h-full py-4">
                  <CardHeader className="px-4">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{listing.gameName}</CardTitle>
                      <Badge variant={listing.status === "rated" ? "default" : "secondary"}>
                        <CircleDotIcon aria-hidden />
                        {STATUS_LABELS[listing.status]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {listing.studioName} · submitted {listing.submittedAt}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 px-4 text-sm">
                    <p className="text-muted-foreground">“{listing.pitch}”</p>
                    <div className="flex flex-wrap gap-3 text-xs">
                      {listing.website && (
                        <a
                          href={listing.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          Studio site
                        </a>
                      )}
                      {listing.rankedSlug && (
                        <Link
                          href={`/franchises/${listing.rankedSlug}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          View ranking dossier
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Submission form */}
      <section aria-labelledby="submit" className="rounded-lg border bg-card p-5">
        <h2 id="submit" className="text-lg font-semibold">
          Post a listing
        </h2>
        <p className="mt-1 mb-4 max-w-2xl text-sm text-muted-foreground">
          Tell us about your game and why its fans would buy physical merchandise. Required fields
          are marked <span className="text-warning-risk">*</span>.
        </p>
        <SubmissionForm />
      </section>

      {/* Roadmap */}
      <section aria-labelledby="roadmap">
        <h2 id="roadmap" className="text-lg font-semibold">
          What this board feeds: the research roadmap
        </h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {ROADMAP.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="py-4">
                <CardHeader className="px-4">
                  <div className="flex items-center justify-between gap-2">
                    <Icon aria-hidden className="size-4 text-chart-1" />
                    <Badge variant={item.status === "Shipped" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 text-sm text-muted-foreground">{item.body}</CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <p className="rounded-md border p-3 text-xs text-muted-foreground">
        Submitting a listing requests a commercial-potential rating only; it is not a licensing
        offer, and a rating implies no partnership commitment by either side. Submissions are
        public (they are filed as GitHub issues) — don&apos;t include confidential material.
      </p>
    </div>
  );
}
