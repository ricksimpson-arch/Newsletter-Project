"use client";

import * as React from "react";

const EVENT = "lootsignal:storage";

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function parseOr<T>(raw: string | null, fallback: T): T {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * localStorage-backed state via useSyncExternalStore: SSR-safe (server
 * snapshot is "no value"), no hydration mismatch, and synced across
 * same-page consumers and other tabs.
 *
 * Pass a stable `initialValue` (module constant) so the returned value
 * keeps a stable identity between renders.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const subscribe = React.useCallback(
    (onStoreChange: () => void) => {
      const handler = (event: Event) => {
        if (event instanceof StorageEvent && event.key !== key) return;
        if (event instanceof CustomEvent && (event.detail as { key?: string })?.key !== key) return;
        onStoreChange();
      };
      window.addEventListener(EVENT, handler);
      window.addEventListener("storage", handler);
      return () => {
        window.removeEventListener(EVENT, handler);
        window.removeEventListener("storage", handler);
      };
    },
    [key]
  );

  const raw = React.useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null
  );
  const hydrated = React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );

  const value = React.useMemo<T>(() => parseOr(raw, initialValue), [raw, initialValue]);

  const update = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = parseOr(readRaw(key), initialValue);
      const resolved = typeof next === "function" ? (next as (p: T) => T)(current) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage unavailable (private mode); consumers still re-render via event.
      }
      window.dispatchEvent(new CustomEvent(EVENT, { detail: { key } }));
    },
    [key, initialValue]
  );

  return [value, update, hydrated] as const;
}
