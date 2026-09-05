import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThinkingDots, SkeletonBlock } from "@/components/LoadingState";
import { AiCore } from "@/components/AiCore";
import { createProjectFromBlueprint, createProjectFromPrompt } from "@/lib/projects";
import { planAiTask } from "@/lib/ai-engine.functions";
import type { AiTaskPlan } from "@/lib/ai-engine/types";
import { AiEngineStatus, type EnginePhase } from "@/components/AiEngineStatus";
import { AiExecutionPanel, type ExecPhase } from "@/components/AiExecutionPanel";
import { executeAiTask } from "@/lib/ai-engine.functions";
import type { AiExecutionResult } from "@/lib/ai-engine/types";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/builder")({
  validateSearch: (search: Record<string, unknown>) => {
    const out: { prompt?: string; template?: string } = {};
    if (typeof search['prompt'] === "string" && search['prompt']) out.prompt = search['prompt'].slice(0, MAX);
    if (typeof search['template'] === "string" && search['template']) out.template = search['template'];
    return out;
  },
  head: () => ({
    meta: [
      { title: "Builder — идеяңды жаз, AI жасасын | VibeCoding KZ" },
      {
        name: "description",
        content: "Идеяңды қазақша жаз — VibeCoding Builder сайт немесе қосымша құрылымын жасайды.",
      },
      { property: "og:title", content: "VibeCoding Builder" },
      { property: "og:description", content: "Идеяңды жаз — AI жобаңды жасасын." },
    ],
  }),
  component: BuilderPage,
});

const MAX = 600;

const EXAMPLES = [
  "Ресторанға заманауи сайт жаса. Меню, үстел брондау және WhatsApp батырмасы болсын.",
  "Гүл дүкеніне онлайн каталог пен жеткізу формасы керек.",
  "Фитнес-жаттықтырушыға жеке лендинг: бағдарламалар, бағалар, жазылу формасы.",
  "Мектеп курстарына арналған сайт: сабақ кестесі және өтінім формасы.",
];

const STAGES = [
  "Идеяны талдау",
  "Құрылым жоспарлау",
  "Дизайн жүйесін таңдау",
  "Беттерді жинау",
  "Соңғы тексеру",
];

const STATUS_TEXT = [
  "Идеяны талдап жатырмын…",
  "Жоба құрылымын дайындап жатырмын…",
  "Дизайн жүйесін таңдап жатырмын…",
  "Интерфейсті құрып жатырмын…",
  "Соңғы тексеруді жасап жатырмын…",
];

function BuilderPage() {
  const [prompt, setPrompt] = useState("");
  const [stage, setStage] = useState(-1);
  const [done, setDone] = useState(false);
  const [projectName, setProjectName] = useState("");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { user } = useAuth();
  const [phase, setPhase] = useState<EnginePhase>("idle");
  const [plan, setPlan] = useState<AiTaskPlan | null>(null);
  const [engineError, setEngineError] = useState<string | null>(null);
  const requestPlan = useServerFn(planAiTask);
  const runTask = useServerFn(executeAiTask);
  const [execState, setExecState] = useState<ExecPhase>("idle");
  const [execResult, setExecResult] = useState<AiExecutionResult | null>(null);
  const [execError, setExecError] = useState<string | null>(null);
  const [execBudget, setExecBudget] = useState<{ estimated: number; max: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const createProject = async () => {
    if (!user || !execResult || creating || createdId) return;
    setCreating(true);
    try {
      const project = await createProjectFromBlueprint(user.id, execResult.project, prompt.trim());
      setCreatedId(project.id);
      toast.success("Жоба сақталды");
      void navigate({ to: "/project/$projectId", params: { projectId: project.id } });
    } catch {
      toast.error("Жоба сақталмады. Қайта көр.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const generating = stage >= 0 && !done;

  const generate = () => {
    if (prompt.trim().length < 10) {
      toast.error("Идеяңды сәл толығырақ жаз");
      return;
    }
    setDone(false);
    setStage(0);
    setPlan(null);
    setEngineError(null);
    setExecResult(null);
    setExecError(null);
    setExecBudget(null);
    setCreatedId(null);
    setExecState(user ? "planning" : "idle");
    setPhase("analyzing");
    timers.current.push(setTimeout(() => setPhase((p) => (p === "analyzing" ? "planning" : p)), 700));

    void requestPlan({ data: { prompt: prompt.trim(), maxCredits: 100 } })
      .then((res) => {
        if (res.ok) {
          setPlan(res.plan);
          setPhase("selecting");
          timers.current.push(setTimeout(() => setPhase("ready"), 600));
          setExecBudget({
            estimated: res.plan.budget.estimatedCredits,
            max: res.plan.budget.maxCredits,
          });
          if (!user) return;
          if (!res.plan.budget.withinBudget) {
            setExecState("failed");
            setExecError("Болжамды шығын бюджеттен асады — орындау тоқтатылды.");
            return;
          }
          setExecState("running");
          void runTask({ data: { prompt: prompt.trim(), maxCredits: 100 } })
            .then((exec) => {
              if (exec.ok) {
                setExecResult(exec.result);
                setExecState("completed");
              } else {
                setExecError(exec.message);
                setExecState("failed");
              }
            })
            .catch(() => {
              setExecError("Провайдерге қосыла алмадым.");
              setExecState("failed");
            });
        } else {
          setEngineError(res.message);
          setPhase("error");
        }
      })
      .catch(() => {
        setEngineError("AI Engine-ге қосыла алмадым.");
        setPhase("error");
      });

    timers.current.forEach(clearTimeout);
    timers.current = STAGES.map((_, i) =>
      setTimeout(
        () => {
          if (i === STAGES.length - 1) {
            if (user) {
              setProjectName(prompt.trim().split(/[.\n]/)[0]?.slice(0, 46) || "Жаңа AI жоба");
              setDone(true);
              setStage(STAGES.length);
            } else {
              void createProjectFromPrompt(prompt, null).then((project) => {
                setProjectName(project.name);
                setDone(true);
                setStage(STAGES.length);
                toast.success("Жоба дайын. Сақтау үшін аккаунтқа кір.");
              });
            }

          } else {
            setStage(i + 1);
          }
        },
        (i + 1) * 900,
      ),
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="animate-rise text-center">
        <AiCore state={generating ? "thinking" : done ? "success" : "idle"} size="md" className="mx-auto" />
        <span className="glass mt-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-primary-glow">
          <Sparkles className="size-3.5" /> VibeCoding Builder
        </span>
        <h1 className="mt-5 text-3xl leading-tight font-bold text-balance sm:text-5xl">
          Идеяңды жаз — <span className="text-gradient">AI жобаңды жасасын.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Не жасағың келетінін қарапайым сөзбен жаз. Қалғанын Builder өзі шешеді.
        </p>
      </div>

      {/* Input */}
      <div className="animate-rise surface-card mt-10 rounded-4xl p-4 transition-shadow duration-300 focus-within:shadow-[var(--shadow-glow)] sm:p-6">
        <textarea
          value={prompt}
          maxLength={MAX}
          rows={6}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Мысалы: Ресторанға заманауи сайт жаса. Меню, үстел брондау және WhatsApp батырмасы болсын."
          className="w-full resize-none bg-transparent text-base leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <span
            className={cn(
              "text-xs tabular-nums",
              prompt.length > MAX * 0.9 ? "text-warning" : "text-muted-foreground",
            )}
          >
            {prompt.length} / {MAX}
          </span>
          <Button variant="hero" size="lg" className="press" onClick={generate} disabled={generating}>
            <Wand2 />
            {generating ? "Жасалуда..." : "Генерациялау"}
          </Button>
        </div>
      </div>

      {/* Examples */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Мысал промпттар</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex}
              type="button"
              onClick={() => setPrompt(ex)}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-rise glass rounded-2xl p-3 text-left text-xs leading-relaxed text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-foreground"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <AiEngineStatus phase={phase} plan={plan} error={engineError} className="mt-6" />

      <AiExecutionPanel
        state={execState}
        estimatedCredits={execBudget?.estimated ?? null}
        maxCredits={execBudget?.max ?? null}
        result={execResult}
        error={execError}
        className="mt-4"
      />

      {user && execResult ? (
        <div className="glass animate-rise mt-4 flex flex-col gap-3 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="text-sm font-semibold">Blueprint дайын — нақты жобаға айналдыр.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Жоба Projects бөлімінде сақталады және кез келген уақытта ашылады.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {createdId ? (
              <Button asChild variant="hero">
                <Link to="/project/$projectId" params={{ projectId: createdId }}>
                  Жобаны ашу <ArrowRight />
                </Link>
              </Button>
            ) : (
              <Button variant="hero" onClick={() => void createProject()} disabled={creating}>
                {creating ? "Сақталуда..." : "Жоба жасау"}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {/* Generation state / preview */}
      {stage >= 0 && (
        <div className="animate-rise surface-card mt-8 rounded-4xl p-5 sm:p-7">
          {!done ? (
            <>
              <div className="flex flex-col items-center gap-4 text-center">
                <AiCore state="thinking" size="md" />
                <p className="font-display text-lg font-semibold text-balance">
                  {STATUS_TEXT[Math.min(stage, STATUS_TEXT.length - 1)]}
                </p>
                <ThinkingDots />
                <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-[image:var(--gradient-primary)] transition-[width] duration-700 ease-out"
                    style={{ width: `${((stage + 1) / (STAGES.length + 1)) * 100}%` }}
                  />
                </div>
              </div>
              <ul className="mt-6 space-y-2.5">
                {STAGES.map((s, i) => (
                  <li key={s} className="flex items-center gap-3 text-sm">
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full border text-[10px] transition-all duration-500",
                        i < stage
                          ? "border-success/40 bg-success/15 text-success"
                          : i === stage
                            ? "animate-pulse-glow border-primary/50 bg-primary/15 text-primary-glow"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      {i < stage ? <Check className="size-3" /> : i + 1}
                    </span>
                    <span
                      className={cn(
                        "transition-colors duration-500",
                        i <= stage ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 space-y-3">
                <SkeletonBlock className="h-28 w-full" />
                <div className="grid grid-cols-3 gap-3">
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                  <SkeletonBlock className="h-16" />
                </div>
              </div>
            </>

          ) : (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="animate-fade-in inline-flex items-center gap-2 text-xs text-success">
                    <Check className="size-4" /> Дайын
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold">{projectName}</h2>
                </div>
                <Button asChild variant="glass" size="sm">
                  <Link to="/projects">
                    Жобаларым <ArrowRight />
                  </Link>
                </Button>
              </div>

              {/* Preview mock */}
              <div className="mt-5 overflow-hidden rounded-3xl border border-border">
                <div className="flex items-center gap-1.5 border-b border-border bg-surface/70 px-4 py-2.5">
                  <span className="size-2.5 rounded-full bg-destructive/60" />
                  <span className="size-2.5 rounded-full bg-warning/60" />
                  <span className="size-2.5 rounded-full bg-success/60" />
                  <span className="ml-3 truncate text-[11px] text-muted-foreground">
                    preview.vibecoding.kz
                  </span>
                </div>
                <div className="bg-surface/40 p-5">
                  <div className="rounded-2xl bg-[image:var(--gradient-soft)] p-6">
                    <div className="h-3 w-1/3 rounded-full bg-primary/40" />
                    <div className="mt-3 h-2 w-2/3 rounded-full bg-muted-foreground/25" />
                    <div className="mt-2 h-2 w-1/2 rounded-full bg-muted-foreground/20" />
                    <div className="mt-5 h-8 w-32 rounded-xl bg-[image:var(--gradient-primary)]" />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="rounded-2xl border border-border bg-card/60 p-4">
                        <div className="h-2 w-2/3 rounded-full bg-muted-foreground/30" />
                        <div className="mt-2 h-2 w-full rounded-full bg-muted-foreground/15" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
