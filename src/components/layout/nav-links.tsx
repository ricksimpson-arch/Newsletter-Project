"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DatabaseIcon,
  FlaskConicalIcon,
  GitCompareArrowsIcon,
  LayoutDashboardIcon,
  ListOrderedIcon,
  ScaleIcon,
  ScrollTextIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboardIcon },
  { href: "/rankings", label: "Rankings", icon: ListOrderedIcon },
  { href: "/compare", label: "Compare", icon: GitCompareArrowsIcon },
  { href: "/forecast", label: "Forecast Lab", icon: FlaskConicalIcon },
  { href: "/benchmarks", label: "Benchmarks", icon: ScaleIcon },
  { href: "/methodology", label: "Methodology", icon: ScrollTextIcon },
  { href: "/data-room", label: "Data Room", icon: DatabaseIcon },
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon aria-hidden className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
