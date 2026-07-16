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
  trigger,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  /** Custom visible trigger content; defaults to an info icon. */
  trigger?: React.ReactNode;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={label}
          className={cn(
            "inline-flex items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            trigger ? "rounded-sm" : "size-5",
            className
          )}
        >
          {trigger ?? <InfoIcon aria-hidden className="size-3.5" />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm" side="top">
        {children}
      </PopoverContent>
    </Popover>
  );
}
