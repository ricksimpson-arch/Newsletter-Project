import * as React from "react";

import type { Franchise } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Abstract, original placeholder art shown while `heroImage` is null.
 * A deterministic geometric composition derived from the slug — no
 * franchise trade dress, no copyrighted artwork.
 */
function hashCode(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const AUDIENCE_HUES: Record<Franchise["audienceType"], [number, number]> = {
  family: [45, 190],
  broad: [215, 260],
  "teen-young-adult": [190, 300],
  adult: [230, 275],
  "collector-niche": [265, 320],
};

export function FranchisePlaceholder({
  franchise,
  className,
}: {
  franchise: Franchise;
  className?: string;
}) {
  const hash = hashCode(franchise.slug);
  const [hueA, hueB] = AUDIENCE_HUES[franchise.audienceType];
  const angle = (hash % 360) + 0.5;
  const shapes = Array.from({ length: 5 }, (_, i) => {
    const seed = hashCode(`${franchise.slug}-${i}`);
    return {
      cx: 8 + (seed % 84),
      cy: 8 + ((seed >> 3) % 84),
      r: 6 + ((seed >> 6) % 18),
      opacity: 0.05 + ((seed >> 9) % 10) / 100,
    };
  });

  return (
    <div
      aria-hidden
      className={cn("relative overflow-hidden rounded-xl border", className)}
      style={{
        background: `linear-gradient(${angle}deg, oklch(0.32 0.06 ${hueA}), oklch(0.22 0.05 ${hueB}))`,
      }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        {shapes.map((shape, index) => (
          <circle
            key={index}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
            fill="white"
            opacity={shape.opacity}
          />
        ))}
        <polyline
          points={`10,${70 + (hash % 12)} 35,${55 + (hash % 9)} 60,${58 + (hash % 6)} 90,${28 + (hash % 10)}`}
          fill="none"
          stroke="white"
          strokeOpacity="0.28"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute right-2 bottom-1.5 text-[9px] font-medium uppercase tracking-widest text-white/40">
        Placeholder — no licensed art
      </span>
    </div>
  );
}
