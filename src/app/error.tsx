"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

/**
 * Global error boundary. The most likely cause of a hard failure is seed
 * data failing Zod validation at module load — surface that plainly.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-warning-risk/40 bg-warning-risk/5 p-16 text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-lg text-sm text-muted-foreground">
        The page failed to render. If this happened right after a data change, the seed data
        likely failed schema validation — run <code className="font-mono">npm test</code> to see
        the exact validation error.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">Error digest: {error.digest}</p>
      )}
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
