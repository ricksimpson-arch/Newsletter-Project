import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function FranchiseNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-16 text-center">
      <h1 className="text-xl font-semibold">Franchise not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        That franchise isn&apos;t in the current 50-franchise dataset. It may have been renamed —
        check the rankings for the full list.
      </p>
      <Button asChild>
        <Link href="/rankings">Back to rankings</Link>
      </Button>
    </div>
  );
}
