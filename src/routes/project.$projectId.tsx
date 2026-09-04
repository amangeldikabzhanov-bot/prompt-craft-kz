import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarClock, Check, Layers, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/LoadingState";
import { useProject } from "@/lib/projects";
import type { ProjectStatus } from "@/components/ProjectCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/project/$projectId")({
  head: () => ({
    meta: [
      { title: "Жоба — жұмыс кеңістігі | VibeCoding KZ" },
      {
        name: "description",
        content: "AI жасаған жоба құрылымы: беттер, функциялар, статус және жаңарту уақыты.",
      },
      { property: "og:title", content: "Жоба — VibeCoding KZ" },
      { property: "og:description", content: "AI жобаңның толық құрылымы бір бетте." },
    ],
  }),
  component: ProjectDetailPage,
});

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

function ProjectDetailPage() {
  const { projectId } = Route.useParams();
  const { project, loading, error } = useProject(projectId);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-5">
        <Link to="/projects">
          <ArrowLeft /> Жобаларым
        </Link>
      </Button>

      {loading ? (
        <LoadingState count={2} />
      ) : error || !project ? (
        <div className="surface-card animate-rise rounded-3xl p-6 text-center">
          <p className="text-sm text-muted-foreground">{error ?? "Жоба табылмады."}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="surface-card animate-rise rounded-3xl p-5 sm:p-7">
            <h1 className="text-2xl font-bold text-balance sm:text-3xl">{project.name}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                  STATUS_STYLE[project.status],
                )}
              >
                {STATUS_LABEL[project.status]}
              </span>
              {project.createdAtLabel ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CalendarClock className="size-3.5" /> Құрылды: {project.createdAtLabel}
                </span>
              ) : null}
              <span className="text-[11px] text-muted-foreground">
                Жаңартылды: {project.updatedAtLabel || project.updatedAt}
              </span>
            </div>
          </div>

          {project.blueprint ? (
            <div className="surface-card animate-rise rounded-3xl p-5 sm:p-7">
              <p className="inline-flex items-center gap-2 text-xs font-medium text-primary-glow">
                <Sparkles className="size-3.5" /> AI blueprint
              </p>

              {project.blueprint.pages.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium">
                    <Layers className="size-3.5" /> Беттер
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.blueprint.pages.map((p) => (
                      <span
                        key={p}
                        className="rounded-full border border-border bg-surface/50 px-2.5 py-1 text-[11px]"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {project.blueprint.features.length > 0 ? (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium">Функциялар</p>
                  <ul className="space-y-1.5">
                    {project.blueprint.features.map((f) => (
                      <li key={f} className="flex gap-2 text-xs text-muted-foreground">
                        <Check className="mt-0.5 size-3 shrink-0 text-success" />
                        <span className="min-w-0">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {project.blueprint.techNotes ? (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium">Техникалық ескертпелер</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {project.blueprint.techNotes}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="surface-card animate-rise rounded-3xl p-5 text-xs text-muted-foreground sm:p-7">
              Бұл жобада әзірге AI blueprint сақталмаған.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
