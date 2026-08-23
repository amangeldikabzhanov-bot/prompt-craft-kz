// Provider Adapter registry — server-only.
// Adapters describe capabilities; no API keys live in this file and none are
// ever returned to the browser. Real execution arrives in a later phase.
import type { AiProviderDescriptor, AiProviderRole, AiTaskType } from "./types";

/**
 * Registry of known providers. Providers are never deleted automatically —
 * they are marked `disabled` / `restricted` / `unavailable` instead.
 * `status` may later be derived from configured secrets at request time.
 */
const REGISTRY: AiProviderDescriptor[] = [
  {
    id: "lovable-gateway",
    label: "Lovable AI Gateway",
    vendor: "lovable",
    status: "active",
    roles: ["planner", "coder", "designer", "validator"],
    taskTypes: ["coding", "reasoning", "design", "testing"],
    creditsPerStep: 2,
    executable: true,
    note: "Әдепкі провайдер — кілт серверде басқарылады.",
  },
  {
    id: "openai",
    label: "OpenAI",
    vendor: "openai",
    status: "unavailable",
    roles: ["planner", "coder", "validator"],
    taskTypes: ["coding", "reasoning", "testing"],
    creditsPerStep: 3,
    executable: false,
    note: "Кілт қосылмаған.",
  },
  {
    id: "anthropic",
    label: "Anthropic Claude",
    vendor: "anthropic",
    status: "unavailable",
    roles: ["planner", "coder", "validator"],
    taskTypes: ["coding", "reasoning", "testing"],
    creditsPerStep: 3,
    executable: false,
    note: "Кілт қосылмаған.",
  },
  {
    id: "google-gemini",
    label: "Google Gemini",
    vendor: "google",
    status: "unavailable",
    roles: ["planner", "coder", "designer"],
    taskTypes: ["coding", "reasoning", "design"],
    creditsPerStep: 2,
    executable: false,
    note: "Кілт қосылмаған.",
  },
  {
    id: "visual-image",
    label: "Visual AI (image)",
    vendor: "generic-visual",
    status: "restricted",
    roles: ["image", "designer"],
    taskTypes: ["image", "design"],
    creditsPerStep: 6,
    executable: false,
    note: "Келесі фазада қосылады.",
  },
  {
    id: "video-engine",
    label: "Video AI",
    vendor: "generic-video",
    status: "restricted",
    roles: ["video"],
    taskTypes: ["video"],
    creditsPerStep: 20,
    executable: false,
    note: "Келесі фазада қосылады.",
  },
  {
    id: "three-d-engine",
    label: "3D / Animation AI",
    vendor: "generic-3d",
    status: "disabled",
    roles: ["3d"],
    taskTypes: ["3d"],
    creditsPerStep: 30,
    executable: false,
    note: "Әзірге өшірулі.",
  },
  {
    id: "voice-engine",
    label: "Voice AI",
    vendor: "generic-voice",
    status: "restricted",
    roles: ["voice"],
    taskTypes: ["voice"],
    creditsPerStep: 4,
    executable: false,
    note: "Келесі фазада қосылады.",
  },
];

export function listProviders(): AiProviderDescriptor[] {
  return REGISTRY.map((p) => ({ ...p }));
}

export function getProvider(id: string): AiProviderDescriptor | undefined {
  const found = REGISTRY.find((p) => p.id === id);
  return found ? { ...found } : undefined;
}

/** Best provider for a role+task, preferring active > restricted > others. */
export function selectProvider(
  role: AiProviderRole,
  taskType: AiTaskType,
  available: AiProviderDescriptor[] = listProviders(),
): AiProviderDescriptor | null {
  const rank: Record<string, number> = { active: 0, restricted: 1, disabled: 2, unavailable: 3 };
  const candidates = available
    .filter((p) => p.roles.includes(role) && p.taskTypes.includes(taskType))
    .sort((a, b) => rank[a.status]! - rank[b.status]! || a.creditsPerStep - b.creditsPerStep);
  return candidates[0] ?? null;
}
