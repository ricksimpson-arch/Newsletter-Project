"use client";

import * as React from "react";
import { InfoIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/**
 * Keyboard-reachable explanatory tooltip. Uses a popover on a real
 * button so it works with keyboard, touch, and screen readers — never
 * hover-only.
 */
export function InfoTip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            className
          )}
        >
          <InfoIcon aria-hidden className="size-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" side="top">
        {children}
      </PopoverContent>
    </Popover>
  );
}
