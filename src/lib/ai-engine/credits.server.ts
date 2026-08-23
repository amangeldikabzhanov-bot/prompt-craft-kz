// Credit Estimator — data model + validation only. No payments.
import {
  DEFAULT_MAX_CREDITS,
  MAX_ALLOWED_CREDITS,
  type AiCreditBudget,
  type AiPlanStep,
} from "./types";

export function normalizeMaxCredits(input: number | undefined | null): number {
  if (typeof input !== "number" || !Number.isFinite(input)) return DEFAULT_MAX_CREDITS;
  const rounded = Math.floor(input);
  if (rounded < 1) return 1;
  if (rounded > MAX_ALLOWED_CREDITS) return MAX_ALLOWED_CREDITS;
  return rounded;
}

export function estimateBudget(steps: AiPlanStep[], maxCredits: number): AiCreditBudget {
  const estimatedCredits = steps.reduce((sum, s) => sum + s.estimatedCredits, 0);
  return {
    maxCredits,
    estimatedCredits,
    withinBudget: estimatedCredits <= maxCredits,
    remainingCredits: Math.max(0, maxCredits - estimatedCredits),
  };
}
