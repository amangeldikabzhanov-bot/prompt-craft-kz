// Orchestrator — analyze → classify → select providers → estimate credits → plan.
// It does NOT execute anything and never runs generated code.
import { ActivityLog } from "./activity.server";
import { estimateBudget, normalizeMaxCredits } from "./credits.server";
import { buildSteps } from "./planner.server";
import { listProviders } from "./providers.server";
import { classifyTaskTypes, primaryTaskType } from "./router.server";
import {
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
  type AiPlanRequest,
  type AiTaskPlan,
  type AiTaskType,
} from "./types";

export class AiEngineError extends Error {
  constructor(
    message: string,
    readonly code: "invalid_input" | "no_provider" | "budget_exceeded" | "internal" = "internal",
  ) {
    super(message);
    this.name = "AiEngineError";
  }
}

function newTaskId(): string {
  return `task_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createTaskPlan(request: AiPlanRequest): AiTaskPlan {
  const prompt = (request.prompt ?? "").trim();
  if (prompt.length < MIN_PROMPT_LENGTH) {
    throw new AiEngineError("Идея тым қысқа.", "invalid_input");
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new AiEngineError("Идея тым ұзын.", "invalid_input");
  }

  const log = new ActivityLog();
  const taskId = newTaskId();
  log.add("task_created", "Тапсырма жасалды", { taskId });

  log.add("planning_started", "Идея талдануда");
  const detected: AiTaskType[] = request.taskTypeHint
    ? Array.from(new Set([request.taskTypeHint, ...classifyTaskTypes(prompt)]))
    : classifyTaskTypes(prompt);
  const primary = request.taskTypeHint ?? primaryTaskType(detected);

  const providers = listProviders();
  const steps = buildSteps([primary, ...detected.filter((t) => t !== primary)], providers);
  if (steps.length === 0) {
    throw new AiEngineError("Сәйкес провайдер табылмады.", "no_provider");
  }

  const selected = steps.find((s) => s.providerId)?.providerLabel ?? "—";
  log.add("provider_selected", `Провайдер таңдалды: ${selected}`, { steps: steps.length });

  const budget = estimateBudget(steps, normalizeMaxCredits(request.maxCredits));

  const warnings: string[] = [];
  if (!budget.withinBudget) {
    warnings.push(
      `Болжам ${budget.estimatedCredits} кредит — лимиттен (${budget.maxCredits}) асады.`,
    );
  }
  for (const step of steps) {
    if (step.providerStatus !== "active") {
      warnings.push(`${step.providerLabel} — қазір қолжетімсіз (${step.providerStatus}).`);
    }
  }

  const context = request.projectContext?.projectName
    ? ` Жоба: ${request.projectContext.projectName}.`
    : "";

  return {
    taskId,
    createdAt: new Date().toISOString(),
    state: "planning",
    primaryTaskType: primary,
    detectedTaskTypes: detected,
    summary: `${steps.length} қадамдық жоспар дайын (${primary}).${context}`,
    steps,
    budget,
    providers,
    events: log.all(),
    warnings: Array.from(new Set(warnings)),
  };
}
