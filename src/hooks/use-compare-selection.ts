"use client";

import * as React from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

const COMPARE_KEY = "lootsignal:compare";
const EMPTY: string[] = [];
export const COMPARE_LIMIT = 4;

export function useCompareSelection() {
  const [slugs, setSlugs, hydrated] = useLocalStorage<string[]>(COMPARE_KEY, EMPTY);

  const toggle = React.useCallback(
    (slug: string) => {
      setSlugs((prev) => {
        if (prev.includes(slug)) return prev.filter((s) => s !== slug);
        if (prev.length >= COMPARE_LIMIT) return prev;
        return [...prev, slug];
      });
    },
    [setSlugs]
  );

  const remove = React.useCallback(
    (slug: string) => setSlugs((prev) => prev.filter((s) => s !== slug)),
    [setSlugs]
  );

  const clear = React.useCallback(() => setSlugs([]), [setSlugs]);
  const has = React.useCallback((slug: string) => slugs.includes(slug), [slugs]);
  const full = slugs.length >= COMPARE_LIMIT;

  return { slugs, toggle, remove, clear, has, full, hydrated };
}
