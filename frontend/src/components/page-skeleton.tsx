import { Skeleton } from "@/components/ui/skeleton";

type PageSkeletonProps = {
  cards?: number;
  rows?: number;
};

export function PageSkeleton({ cards = 3, rows = 6 }: PageSkeletonProps) {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, i) => (
          <div key={`sk-card-${i}`} className="rounded-3xl border border-slate-200/60 dark:border-white/10 p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-16 mt-4" />
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200/60 dark:border-white/10 p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={`sk-row-${i}`} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
