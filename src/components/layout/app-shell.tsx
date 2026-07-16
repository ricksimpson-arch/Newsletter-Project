import * as React from "react";
import Link from "next/link";

import { LogoHorizontal } from "@/components/brand/logo";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { ThemeToggle } from "@/components/layout/theme-toggle";

function Footer() {
  return (
    <footer className="border-t px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted-foreground">
        <p>
          LootSignal is an internal commercial-analysis tool. Franchise names and trademarks
          belong to their respective owners; they are referenced for identification only.
          Rankings and forecasts represent internal analysis and imply no endorsement,
          affiliation, or sponsorship by any rights holder.
        </p>
        <p>
          Scores are directional research estimates — not legal advice and not predictions of
          actual sales or profit.
        </p>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <div className="sticky top-0 flex h-svh flex-col gap-6 p-4">
          <Link
            href="/"
            className="flex items-center rounded-md px-2 py-1 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label="LootSignal home"
          >
            <LogoHorizontal />
          </Link>
          <NavLinks />
          <div className="mt-auto flex items-center justify-between gap-2 border-t pt-3">
            <p className="text-xs text-sidebar-foreground/60">
              Internal research
              <br />
              build · Jul 2026
            </p>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile / tablet header */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
          <div className="flex items-center gap-1">
            <MobileNav />
            <Link href="/" aria-label="LootSignal home" className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <LogoHorizontal />
            </Link>
          </div>
          <ThemeToggle />
        </header>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
