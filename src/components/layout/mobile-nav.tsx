"use client";

import * as React from "react";
import { MenuIcon } from "lucide-react";

import { LogoHorizontal } from "@/components/brand/logo";
import { NavLinks } from "@/components/layout/nav-links";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation menu">
          <MenuIcon aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar text-sidebar-foreground">
        <SheetHeader>
          <SheetTitle asChild>
            <span>
              <LogoHorizontal />
            </span>
          </SheetTitle>
        </SheetHeader>
        <div className="px-4 pb-6">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
