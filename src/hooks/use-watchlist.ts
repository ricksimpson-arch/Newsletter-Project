"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

const WATCHLIST_KEY = "lootsignal:watchlist";
const EMPTY: string[] = [];

export function useWatchlist() {
  const [slugs, setSlugs, hydrated] = useLocalStorage<string[]>(WATCHLIST_KEY, EMPTY);

  const toggle = React.useCallback(
    (slug: string) => {
      setSlugs((prev) =>
        prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      );
    },
    [setSlugs]
  );

  const has = React.useCallback((slug: string) => slugs.includes(slug), [slugs]);

  return { slugs, toggle, has, hydrated };
}
