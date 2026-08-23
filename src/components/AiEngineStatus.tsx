import { Check, Cpu, Loader2, TriangleAlert } from "lucide-react";
import type { AiTaskPlan } from "@/lib/ai-engine/types";
import { cn } from "@/lib/utils";

export type EnginePhase = "idle" | "analyzing" | "planning" | "selecting" | "ready" | "error";

const PHASES: { key: EnginePhase; label: string }[] = [
  { key: "analyzing", label: "Талдау" },
  { key: "planning", label: "Жоспарлау" },
  { key: "selecting", label: "Провайдер таңдалды" },
  { key: "ready", label: "Дайын" },
];

export function AiEngineStatus({
  phase,
  plan,
  error,
  className,
}: {
  phase: EnginePhase;
  plan?: AiTaskPlan | null;
  error?: string | null;
  className?: string;
}) {
  if (phase === "idle") return null;
  const activeIndex = PHASES.findIndex((p) => p.key === phase);

  return (
    <div className={cn("glass animate-rise rounded-3xl p-4 sm:p-5", className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-primary-glow">
        <Cpu className="size-3.5" /> AI Engine
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {PHASES.map((p, i) => {
          const done = phase === "ready" ? true : i < activeIndex;
          const current = i === activeIndex && phase !== "error";
          return (
            <span
              key={p.key}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors duration-500",
                done
                  ? "border-success/40 bg-success/10 text-success"
                  : current
                    ? "border-primary/50 bg-primary/10 text-primary-glow"
                    : "border-border text-muted-foreground",
              )}
            >
              {done ? (
                <Check className="size-3" />
              ) : current ? (
                <Loader2 className="size-3 animate-spin" />
              ) : null}
              {p.label}
            </span>
          );
        })}
      </div>

      {phase === "error" && error ? (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-destructive">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      ) : null}

      {plan ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">{plan.summary}</p>
          <ul className="space-y-1.5">
            {plan.steps.map((s) => (
              <li
                key={s.order}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-border/70 bg-surface/40 px-3 py-2 text-[11px]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-foreground">{s.title}</span>
                  <span className="block truncate text-muted-foreground">
                    {s.providerLabel} · {s.taskType}
                  </span>
                </span>
                <span className="tabular-nums text-muted-foreground">~{s.estimatedCredits} cr</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-muted-foreground">
            Болжамды шығын:{" "}
            <span className={cn("tabular-nums", plan.budget.withinBudget ? "text-success" : "text-warning")}>
              {plan.budget.estimatedCredits} / {plan.budget.maxCredits} кредит
            </span>
          </p>
          {plan.warnings.length > 0 ? (
            <ul className="space-y-1">
              {plan.warnings.slice(0, 3).map((w) => (
                <li key={w} className="text-[11px] text-warning">
                  {w}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
