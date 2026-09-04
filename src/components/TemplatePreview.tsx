import type { TemplatePreview as PreviewKind } from "@/data/templates";
import { cn } from "@/lib/utils";

const bar = "rounded-full bg-primary/25";
const soft = "rounded-full bg-muted-foreground/20";

function Layout({ kind }: { kind: PreviewKind }) {
  if (kind === "grid" || kind === "gallery") {
    return (
      <div className="space-y-2">
        <div className={cn("h-2 w-1/3", bar)} />
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-md bg-surface-2/80" />
          ))}
        </div>
      </div>
    );
  }
  if (kind === "hero") {
    return (
      <div className="space-y-2">
        <div className="h-10 rounded-lg bg-[image:var(--gradient-primary)] opacity-70" />
        <div className={cn("h-2 w-2/3", soft)} />
        <div className="grid grid-cols-2 gap-1.5">
          <div className="h-7 rounded-md bg-surface-2/80" />
          <div className="h-7 rounded-md bg-surface-2/80" />
        </div>
      </div>
    );
  }
  if (kind === "split") {
    return (
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <div className={cn("h-2 w-3/4", bar)} />
          <div className={cn("h-1.5 w-full", soft)} />
          <div className={cn("h-1.5 w-2/3", soft)} />
          <div className="h-5 w-14 rounded-md bg-[image:var(--gradient-primary)] opacity-80" />
        </div>
        <div className="h-full min-h-16 rounded-lg bg-surface-2/80" />
      </div>
    );
  }
  if (kind === "list" || kind === "feed") {
    return (
      <div className="space-y-1.5">
        <div className={cn("h-2 w-1/2", bar)} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md bg-surface-2/70 p-1.5">
            <div className="size-6 shrink-0 rounded-md bg-primary/20" />
            <div className="min-w-0 flex-1 space-y-1">
              <div className={cn("h-1.5 w-2/3", soft)} />
              <div className={cn("h-1.5 w-1/3", soft)} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (kind === "showcase") {
    return (
      <div className="space-y-2">
        <div className="h-12 rounded-lg bg-surface-2/80" />
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 rounded-md bg-primary/15" />
          ))}
        </div>
        <div className={cn("h-1.5 w-1/2", soft)} />
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className={cn("h-2 w-2/5", bar)} />
      <div className="grid grid-cols-2 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 rounded-md bg-surface-2/80" />
        ))}
      </div>
    </div>
  );
}

/** Lightweight CSS "3D" preview — perspective + layered cards, no WebGL. */
export function TemplatePreviewFrame({ kind }: { kind: PreviewKind }) {
  return (
    <div className="[perspective:900px]">
      <div className="relative transition-transform duration-500 ease-out [transform:rotateX(12deg)_rotateY(-10deg)] group-hover:[transform:rotateX(4deg)_rotateY(-3deg)_translateY(-4px)]">
        <div
          aria-hidden
          className="absolute inset-x-3 -bottom-2 h-full rounded-2xl border border-border/60 bg-surface/40 [transform:translateZ(-30px)]"
        />
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/70 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-1 border-b border-border/70 bg-surface/60 px-2.5 py-1.5">
            <span className="size-1.5 rounded-full bg-destructive/50" />
            <span className="size-1.5 rounded-full bg-warning/50" />
            <span className="size-1.5 rounded-full bg-success/50" />
          </div>
          <div className="p-3">
            <Layout kind={kind} />
          </div>
        </div>
      </div>
    </div>
  );
}
