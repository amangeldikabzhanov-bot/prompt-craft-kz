import { Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProjectStatus = "draft" | "building" | "ready";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  updatedAt: string;
  progress: number;
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  draft: "Жоба (draft)",
  building: "Жасалуда",
  ready: "Дайын",
};

const STATUS_STYLE: Record<ProjectStatus, string> = {
  draft: "border-border bg-surface-2/70 text-muted-foreground",
  building: "border-warning/30 bg-warning/10 text-warning",
  ready: "border-success/30 bg-success/10 text-success",
};

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <article
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
      className="animate-rise surface-card card-interactive group rounded-3xl p-5"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{project.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        </div>
        <button
          type="button"
          aria-label="Опциялар"
          className="shrink-0 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[11px] font-medium",
            STATUS_STYLE[project.status],
          )}
        >
          {STATUS_LABEL[project.status]}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="size-3.5" />
          {project.updatedAt}
        </span>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Дайындық</span>
          <span className="font-medium text-foreground">{project.progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-700"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}
