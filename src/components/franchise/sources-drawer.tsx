"use client";

import { BookMarkedIcon, ExternalLinkIcon } from "lucide-react";

import { FreshnessBadge, SourceTierBadge } from "@/components/indicators";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { freshnessStatus } from "@/lib/freshness";
import type { ResearchSource } from "@/lib/types";

export function SourcesDrawer({
  sources,
  franchiseName,
}: {
  sources: ResearchSource[];
  franchiseName: string;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <BookMarkedIcon aria-hidden />
          Sources ({sources.length})
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Connected sources</SheetTitle>
          <SheetDescription>
            Research sources linked to {franchiseName}. Data was captured as of the access dates —
            nothing is fetched live.
          </SheetDescription>
        </SheetHeader>
        <ul className="space-y-3 px-4 pb-6">
          {sources.map((source) => (
            <li key={source.id} className="rounded-lg border p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-snug">{source.title}</p>
                <SourceTierBadge tier={source.tier} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{source.publisher}</p>
              <dl className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground tnum">
                <div>
                  <dt className="inline">Published: </dt>
                  <dd className="inline">{source.publishedAt ?? "Not dated"}</dd>
                </div>
                <div>
                  <dt className="inline">Accessed: </dt>
                  <dd className="inline">{source.accessedAt}</dd>
                </div>
              </dl>
              <div className="mt-2 flex items-center justify-between gap-2">
                <FreshnessBadge status={freshnessStatus(source.publishedAt ?? source.accessedAt)} />
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                >
                  Open source <ExternalLinkIcon aria-hidden className="size-3" />
                </a>
              </div>
              {source.notes && <p className="mt-2 text-xs text-muted-foreground">{source.notes}</p>}
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
