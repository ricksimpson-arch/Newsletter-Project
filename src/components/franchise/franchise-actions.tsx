"use client";

import Link from "next/link";
import { GitCompareArrowsIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompareSelection } from "@/hooks/use-compare-selection";
import { useWatchlist } from "@/hooks/use-watchlist";
import { cn } from "@/lib/utils";

export function FranchiseActions({ slug, name }: { slug: string; name: string }) {
  const watchlist = useWatchlist();
  const compare = useCompareSelection();
  const watching = watchlist.has(slug);
  const comparing = compare.has(slug);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={watching ? "secondary" : "outline"}
        size="sm"
        aria-pressed={watching}
        onClick={() => watchlist.toggle(slug)}
      >
        <StarIcon aria-hidden className={cn(watching && "fill-opportunity text-opportunity")} />
        {watching ? "On watchlist" : "Add to watchlist"}
      </Button>
      <Button
        variant={comparing ? "secondary" : "outline"}
        size="sm"
        aria-pressed={comparing}
        disabled={!comparing && compare.full}
        onClick={() => compare.toggle(slug)}
      >
        <GitCompareArrowsIcon aria-hidden />
        {comparing ? "In comparison" : "Add to compare"}
      </Button>
      {compare.slugs.length >= 2 && (
        <Button asChild size="sm" variant="ghost">
          <Link href={`/compare?f=${compare.slugs.join(",")}`}>
            Open comparison ({compare.slugs.length})
          </Link>
        </Button>
      )}
      <span className="sr-only" aria-live="polite">
        {watching ? `${name} is on your watchlist` : ""}
      </span>
    </div>
  );
}
