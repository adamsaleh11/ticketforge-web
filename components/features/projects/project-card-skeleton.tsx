import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="glass-card min-h-52 rounded-lg p-5 shadow-2xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-5 w-3/4 bg-white/10" />
          <Skeleton className="h-4 w-full bg-white/10" />
          <Skeleton className="h-4 w-5/6 bg-white/10" />
        </div>
        <Skeleton className="size-8 rounded-lg bg-white/10" />
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20 rounded-full bg-white/10" />
        <Skeleton className="h-6 w-24 rounded-full bg-white/10" />
      </div>
      <Skeleton className="mt-7 h-4 w-24 bg-white/10" />
    </div>
  );
}
