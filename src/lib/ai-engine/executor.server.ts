// Provider execution — server-only. Uses the existing orchestrator plan and the
// Provider Adapter registry; executes exactly one real provider (Lovable AI Gateway).
// No provider secret is ever returned, logged, or sent to the browser.
import { streamText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { ActivityLog } from "./activity.server";
import { createLovableAiGatewayProvider, GATEWAY_CHAT_MODEL } from "./gateway.server";
import { getProvider } from "./providers.server";
import {
  EXECUTION_TIMEOUT_MS,
  type AiActivityEvent,
  type AiErrorCode,
  type AiExecutionResult,
  type AiGeneratedProject,
  type AiTaskPlan,
} from "./types";

export class AiExecutionError extends Error {
  constructor(
    message: string,
    readonly code: AiErrorCode,
    readonly events: AiActivityEvent[] = [],
  ) {
    super(message);
    this.name = "AiExecutionError";
  }
}

const EXECUTABLE_PROVIDER_ID = "lovable-gateway";

const projectSchema = z.object({
  name: z.string(),
  description: z.string(),
  pages: z.array(z.string()),
  features: z.array(z.string()),
  techNotes: z.string(),
});

const SYSTEM_PROMPT = [
  "Сен VibeCoding KZ платформасының жоспарлаушы AI-ысың.",
  "Пайдаланушының идеясынан веб-жоба құрылымын жасайсың.",
  "Жауап тек қазақ тілінде. 4-7 бет, 4-8 функция. Қысқа әрі нақты жаз.",
  "techNotes — 1-2 сөйлем техникалық ұсыныс.",
  "Ешқашан код орындама, тек құрылым сипатта.",
].join(" ");

function statusToError(status: number): { code: AiErrorCode; message: string } {
  if (status === 429)
    return { code: "rate_limited", message: "Сұраныс шегі асты. Сәл кідіріп қайталап көр." };
  if (status === 402)
    return { code: "provider_unavailable", message: "AI кредиттері бітті. Workspace балансын толтыр." };
  if (status === 403)
    return { code: "provider_unavailable", message: "AI провайдері бұғатталған." };
  if (status === 401)
    return { code: "provider_not_configured", message: "AI провайдері дұрыс бапталмаған." };
  if (status >= 500) return { code: "provider_error", message: "Провайдер уақытша қолжетімсіз." };
  return { code: "provider_error", message: "Провайдер сұранысты орындай алмады." };
}

function toStringList(value: unknown, max: number, len: number): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v : typeof v === "object" && v ? String((v as Record<string, unknown>)["name"] ?? "") : ""))
    .filter(Boolean)
    .slice(0, max)
    .map((v) => v.slice(0, len));
}

function normalize(value: unknown): AiGeneratedProject {
  const o = (value ?? {}) as Record<string, unknown>;
  return {
    name: String(o["name"] ?? "AI жоба").slice(0, 120),
    description: String(o["description"] ?? "").slice(0, 400),
    pages: toStringList(o["pages"], 8, 80),
    features: toStringList(o["features"], 10, 100),
    techNotes: String(o["techNotes"] ?? "").slice(0, 400),
  };
}

function parseFallback(text: string | undefined): unknown {
  if (!text) return null;
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export async function executePlan(params: {
  prompt: string;
  plan: AiTaskPlan;
}): Promise<AiExecutionResult> {
  const { prompt, plan } = params;
  const log = new ActivityLog();
  for (const e of plan.events) log.add(e.type, e.message, e.data);

  // Budget gate — never execute over the user's allowed budget.
  if (!plan.budget.withinBudget) {
    log.add("task_failed", "Бюджеттен асып кетті");
    throw new AiExecutionError(
      `Болжамды шығын (${plan.budget.estimatedCredits}) лимиттен (${plan.budget.maxCredits}) асады.`,
      "budget_exceeded",
      log.all(),
    );
  }

  const provider = getProvider(EXECUTABLE_PROVIDER_ID);
  if (!provider || provider.status !== "active" || !provider.executable) {
    log.add("task_failed", "Провайдер қолжетімсіз");
    throw new AiExecutionError("Провайдер қолжетімсіз.", "provider_unavailable", log.all());
  }

  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    log.add("task_failed", "Провайдер бапталмаған");
    throw new AiExecutionError(
      "AI провайдері бапталмаған.",
      "provider_not_configured",
      log.all(),
    );
  }

  log.add("generation_started", `Орындалуда: ${provider.label}`, { model: GATEWAY_CHAT_MODEL });

  const gateway = createLovableAiGatewayProvider(apiKey);
  const controller = new AbortController();
  // Generous ceiling only — never an aggressive client-side deadline.
  const timeout = setTimeout(() => controller.abort(), EXECUTION_TIMEOUT_MS);

  try {
    // Streaming keeps bytes flowing for long generations; we consume it server-side.
    const result = streamText({
      model: gateway(GATEWAY_CHAT_MODEL),
      system: SYSTEM_PROMPT,
      prompt: `Идея: ${prompt}\n\nНегізгі тапсырма түрі: ${plan.primaryTaskType}.`,
      output: Output.object({ schema: projectSchema }),
      abortSignal: controller.signal,
      maxRetries: 1,
    });

    let output: unknown;
    try {
      output = await result.output;
    } catch (error) {
      if (!NoObjectGeneratedError.isInstance(error)) throw error;
      output = parseFallback(error.text);
      if (!output) throw error;
    }
    const parsed = normalize(output);
    const project: AiGeneratedProject = parsed;

    log.add("generation_completed", "Генерация аяқталды", { pages: project.pages.length });
    log.add("validation_started", "Нәтиже тексерілуде");
    log.add("validation_completed", "Нәтиже жарамды");
    log.add("task_completed", "Тапсырма аяқталды");

    return {
      taskId: plan.taskId,
      state: "completed",
      providerId: provider.id,
      providerLabel: provider.label,
      primaryTaskType: plan.primaryTaskType,
      budget: plan.budget,
      usedCredits: plan.budget.estimatedCredits,
      project,
      events: log.all(),
      warnings: plan.warnings,
    };
  } catch (error) {
    log.add("task_failed", "Тапсырма орындалмады");
    if (controller.signal.aborted) {
      throw new AiExecutionError("Провайдер жауап бермеді (timeout).", "provider_timeout", log.all());
    }
    if (NoObjectGeneratedError.isInstance(error)) {
      throw new AiExecutionError("Нәтиже дұрыс құрылымда келмеді.", "provider_error", log.all());
    }
    const status =
      error && typeof error === "object" && "statusCode" in error
        ? Number((error as { statusCode: unknown }).statusCode)
        : undefined;
    if (typeof status === "number" && Number.isFinite(status)) {
      const mapped = statusToError(status);
      throw new AiExecutionError(mapped.message, mapped.code, log.all());
    }
    // Never surface provider internals / stack traces to the browser.
    console.error("[ai-engine] provider execution failed");
    throw new AiExecutionError("Провайдер қатесі.", "provider_error", log.all());
  } finally {
    clearTimeout(timeout);
  }
}
