// Client-safe shared types for the VibeCoding AI Engine.
// No secrets, no provider SDKs — pure type/enum definitions.

export const AI_TASK_TYPES = [
  "coding",
  "reasoning",
  "design",
  "image",
  "video",
  "3d",
  "voice",
  "testing",
] as const;
export type AiTaskType = (typeof AI_TASK_TYPES)[number];

export const AI_TASK_STATES = [
  "queued",
  "planning",
  "running",
  "testing",
  "completed",
  "failed",
  "cancelled",
] as const;
export type AiTaskState = (typeof AI_TASK_STATES)[number];

export const AI_PROVIDER_STATUSES = ["active", "disabled", "restricted", "unavailable"] as const;
export type AiProviderStatus = (typeof AI_PROVIDER_STATUSES)[number];

export const AI_EVENT_TYPES = [
  "task_created",
  "planning_started",
  "provider_selected",
  "generation_started",
  "generation_completed",
  "validation_started",
  "validation_completed",
  "task_completed",
  "task_failed",
  "task_cancelled",
] as const;
export type AiEventType = (typeof AI_EVENT_TYPES)[number];

export interface AiActivityEvent {
  type: AiEventType;
  at: string;
  message: string;
  data?: Record<string, string | number | boolean | null>;
}

/** A provider role is what a provider is used *for* in a plan step. */
export type AiProviderRole =
  | "planner"
  | "coder"
  | "designer"
  | "image"
  | "video"
  | "3d"
  | "voice"
  | "validator";

export interface AiProviderDescriptor {
  id: string;
  label: string;
  vendor: string;
  status: AiProviderStatus;
  roles: AiProviderRole[];
  taskTypes: AiTaskType[];
  /** Rough cost in credits per 1 unit of work (one generation step). */
  creditsPerStep: number;
  /** Whether the adapter can actually execute today (future phases). */
  executable: boolean;
  note?: string;
}

export interface AiProjectContext {
  projectId?: string | null | undefined;
  projectName?: string | null | undefined;
  description?: string | null | undefined;
  status?: string | null | undefined;
}

export interface AiPlanStep {
  order: number;
  taskType: AiTaskType;
  role: AiProviderRole;
  providerId: string | null;
  providerLabel: string;
  providerStatus: AiProviderStatus;
  title: string;
  estimatedCredits: number;
  state: AiTaskState;
}

export interface AiCreditBudget {
  maxCredits: number;
  estimatedCredits: number;
  withinBudget: boolean;
  remainingCredits: number;
}

export interface AiTaskPlan {
  taskId: string;
  createdAt: string;
  state: AiTaskState;
  primaryTaskType: AiTaskType;
  detectedTaskTypes: AiTaskType[];
  summary: string;
  steps: AiPlanStep[];
  budget: AiCreditBudget;
  providers: AiProviderDescriptor[];
  events: AiActivityEvent[];
  warnings: string[];
}

export interface AiPlanRequest {
  prompt: string;
  maxCredits?: number;
  taskTypeHint?: AiTaskType | null;
  projectContext?: AiProjectContext | null;
}

export const DEFAULT_MAX_CREDITS = 100;
export const MAX_ALLOWED_CREDITS = 10_000;
export const MIN_PROMPT_LENGTH = 10;
export const MAX_PROMPT_LENGTH = 2_000;
