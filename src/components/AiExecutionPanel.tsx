import { Check, Loader2, PlayCircle, TriangleAlert } from "lucide-react";
import type { AiExecutionResult, AiTaskState } from "@/lib/ai-engine/types";
import { cn } from "@/lib/utils";

export type ExecPhase = AiTaskState | "idle";

const FLOW: { key: string; label: string }[] = [
  { key: "planning", label: "Талдау" },
  { key: "queued", label: "Жоспарлау" },
  { key: "selected", label: "Провайдер таңдалды" },
  { key: "running", label: "Орындау" },
  { key: "completed", label: "Дайын" },
];

function activeIndex(state: ExecPhase): number {
  switch (state) {
    case "planning":
      return 0;
    case "queued":
      return 1;
    case "running":
    case "testing":
      return 3;
    case "completed":
      return 4;
    default:
      return 2;
  }
}

export function AiExecutionPanel({
  state,
  estimatedCredits,
  maxCredits,
  result,
  error,
  className,
}: {
  state: ExecPhase;
  estimatedCredits?: number | null;
  maxCredits?: number | null;
  result?: AiExecutionResult | null;
  error?: string | null;
  className?: string;
}) {
  if (state === "idle") return null;
  const idx = activeIndex(state);
  const failed = state === "failed" || state === "cancelled";

  return (
    <div className={cn("glass animate-rise rounded-3xl p-4 sm:p-5", className)}>
      <div className="flex items-center gap-2 text-xs font-medium text-primary-glow">
        <PlayCircle className="size-3.5" /> Провайдер орындауы
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        {FLOW.map((s, i) => {
          const done = state === "completed" ? true : i < idx;
          const current = i === idx && !failed;
          return (
            <span
              key={s.key}
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
              {s.label}
            </span>
          );
        })}
      </div>

      {typeof estimatedCredits === "number" && typeof maxCredits === "number" ? (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Болжамды шығын:{" "}
          <span
            className={cn(
              "tabular-nums",
              estimatedCredits <= maxCredits ? "text-success" : "text-warning",
            )}
          >
            {estimatedCredits} кредит
          </span>{" "}
          · Максимум бюджет: <span className="tabular-nums">{maxCredits} кредит</span>
        </p>
      ) : null}

      {failed && error ? (
        <p className="mt-3 inline-flex items-center gap-2 text-xs text-destructive">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{result.project.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {result.project.description}
            </p>
          </div>
          {result.project.pages.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {result.project.pages.map((p) => (
                <span
                  key={p}
                  className="rounded-full border border-border bg-surface/50 px-2.5 py-1 text-[11px] text-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          ) : null}
          {result.project.features.length > 0 ? (
            <ul className="space-y-1">
              {result.project.features.map((f) => (
                <li key={f} className="flex gap-2 text-[11px] text-muted-foreground">
                  <Check className="mt-0.5 size-3 shrink-0 text-success" />
                  <span className="min-w-0">{f}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <p className="text-[11px] text-muted-foreground">
            {result.providerLabel} · жұмсалған болжам:{" "}
            <span className="tabular-nums">{result.usedCredits}</span> кредит
          </p>
        </div>
      ) : null}
    </div>
  );
}
