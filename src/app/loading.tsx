import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <output aria-label="Loading page" className="block space-y-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </output>
  );
}
