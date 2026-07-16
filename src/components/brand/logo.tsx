import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * LootSignal brand marks — fully original SVG artwork.
 * Motif: an upward forecast line that terminates in a "signal detected"
 * pulse (concentric radar arcs), drawn inside a rounded tag shape.
 */

export function LogoMark({
  className,
  title = "LootSignal",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label={title}
      className={cn("size-8", className)}
    >
      <title>{title}</title>
      <rect x="2" y="2" width="44" height="44" rx="11" className="fill-signal" />
      {/* forecast line rising left → right */}
      <polyline
        points="9,34 17,28 23,31 33,18"
        fill="none"
        className="stroke-signal-foreground"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* signal-detected pulse at the line's end */}
      <circle cx="33" cy="18" r="3.4" className="fill-signal-foreground" />
      <path
        d="M 37.5 11.5 A 8 8 0 0 1 40.4 18"
        fill="none"
        className="stroke-signal-foreground"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.72"
      />
      <path
        d="M 40.6 7.6 A 13 13 0 0 1 45 18"
        fill="none"
        className="stroke-signal-foreground"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.4"
      />
    </svg>
  );
}

export function LogoHorizontal({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="size-7" title="" />
      <span className="text-lg font-bold tracking-tight leading-none">
        Loot<span className="text-signal">Signal</span>
      </span>
    </span>
  );
}

/** Compact sidebar mark: icon plus abbreviated wordmark for tight spaces. */
export function LogoCompact({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <LogoMark className="size-6" title="LootSignal" />
      <span className="text-sm font-bold tracking-tight leading-none">
        L<span className="text-signal">S</span>
      </span>
    </span>
  );
}
