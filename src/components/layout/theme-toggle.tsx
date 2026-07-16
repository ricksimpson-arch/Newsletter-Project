"use client";

import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lootsignal:theme";

/**
 * Stateless toggle: the current theme lives on <html> (set before first
 * paint by the layout's init script), and the icon swap is pure CSS, so
 * server markup is identical in both themes.
 */
export function ThemeToggle() {
  function toggle() {
    const nextIsDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextIsDark);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextIsDark ? "dark" : "light");
    } catch {
      // Persistence unavailable; the in-page toggle still works.
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle color theme">
      <SunIcon aria-hidden className="hidden dark:block" />
      <MoonIcon aria-hidden className="block dark:hidden" />
    </Button>
  );
}
