import { ArrowUpRight } from "lucide-react";
import type { AiTool } from "@/data/tools";
import { cn } from "@/lib/utils";

export function ToolCard({
  tool,
  index = 0,
  className,
}: {
  tool: AiTool;
  index?: number;
  className?: string;
}) {
  return (
    <a
      href={tool.url}
      target="_blank"
      rel="noreferrer noopener"
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
      className={cn(
        "animate-rise surface-card card-interactive group relative flex flex-col overflow-hidden rounded-3xl p-5",
        className,
      )}
    >
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-primary/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] font-display text-lg font-bold text-primary-foreground">
            {tool.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold">{tool.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{tool.category}</p>
          </div>
        </div>
        <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tool.description}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary-glow">
          {tool.pricing}
        </span>
        {tool.tags.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border bg-surface-2/60 px-2.5 py-1 text-[11px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}
