import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-2xl", className)} />;
}

export function LoadingState({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="surface-card rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="size-11" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-3 w-2/3" />
              <SkeletonBlock className="h-2.5 w-1/3" />
            </div>
          </div>
          <SkeletonBlock className="mt-4 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-4/5" />
          <SkeletonBlock className="mt-5 h-6 w-24 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ThinkingDots({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 items-end gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="animate-thinking w-1 rounded-full bg-[image:var(--gradient-primary)]"
            style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}
