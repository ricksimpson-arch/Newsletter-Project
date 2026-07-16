"use client";

import * as React from "react";
import { MoonIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "lootsignal:theme";

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<"dark" | "light" | null>(null);

  React.useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    setTheme(stored === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Render both and pick via CSS so server markup is theme-agnostic. */}
      <SunIcon aria-hidden className="hidden dark:block" />
      <MoonIcon aria-hidden className="block dark:hidden" />
    </Button>
  );
}
