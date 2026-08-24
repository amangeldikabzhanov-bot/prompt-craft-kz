// Public RPC surface of the AI Engine. Only plain DTOs cross this boundary.
// Provider credentials never leave the server and are not part of any payload.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  AI_TASK_TYPES,
  DEFAULT_MAX_CREDITS,
  MAX_ALLOWED_CREDITS,
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
  type AiActivityEvent,
  type AiErrorCode,
  type AiExecutionResult,
  type AiTaskPlan,
} from "./ai-engine/types";

const planInput = z.object({
  prompt: z.string().min(MIN_PROMPT_LENGTH).max(MAX_PROMPT_LENGTH),
  maxCredits: z.number().int().min(1).max(MAX_ALLOWED_CREDITS).optional(),
  taskTypeHint: z.enum(AI_TASK_TYPES).nullable().optional(),
  projectContext: z
    .object({
      projectId: z.string().max(64).nullable().optional(),
      projectName: z.string().max(200).nullable().optional(),
      description: z.string().max(1000).nullable().optional(),
      status: z.string().max(40).nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type PlanAiTaskResult =
  | { ok: true; plan: AiTaskPlan }
  | { ok: false; code: string; message: string };

export const planAiTask = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => planInput.parse(input))
  .handler(async ({ data }): Promise<PlanAiTaskResult> => {
    // Rate-limit-ready: a limiter keyed by caller identity plugs in here.
    const { createTaskPlan, AiEngineError } = await import("./ai-engine/orchestrator.server");
    try {
      const plan = createTaskPlan({
        prompt: data.prompt,
        maxCredits: data.maxCredits ?? DEFAULT_MAX_CREDITS,
        taskTypeHint: data.taskTypeHint ?? null,
        projectContext: data.projectContext ?? null,
      });
      return { ok: true, plan };
    } catch (error) {
      if (error instanceof AiEngineError) {
        return { ok: false, code: error.code, message: error.message };
      }
      console.error("[ai-engine] plan failed", error);
      return { ok: false, code: "internal", message: "AI Engine қатесі. Кейінірек қайталап көр." };
    }
  });

const executeInput = planInput;

export type ExecuteAiTaskResult =
  | { ok: true; result: AiExecutionResult }
  | { ok: false; code: AiErrorCode; message: string; events?: AiActivityEvent[] };

/** Authenticated: plan → budget check → real provider execution → structured result. */
export const executeAiTask = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => executeInput.parse(input))
  .handler(async ({ data }): Promise<ExecuteAiTaskResult> => {
    const { createTaskPlan, AiEngineError } = await import("./ai-engine/orchestrator.server");
    const { executePlan, AiExecutionError } = await import("./ai-engine/executor.server");
    try {
      const plan = createTaskPlan({
        prompt: data.prompt,
        maxCredits: data.maxCredits ?? DEFAULT_MAX_CREDITS,
        taskTypeHint: data.taskTypeHint ?? null,
        projectContext: data.projectContext ?? null,
      });
      const result = await executePlan({ prompt: data.prompt, plan });
      return { ok: true, result };
    } catch (error) {
      if (error instanceof AiExecutionError) {
        return { ok: false, code: error.code, message: error.message, events: error.events };
      }
      if (error instanceof AiEngineError) {
        return { ok: false, code: "invalid_input", message: error.message };
      }
      console.error("[ai-engine] execute failed");
      return { ok: false, code: "internal", message: "AI Engine қатесі. Кейінірек қайталап көр." };
    }
  });
