// Task Planner — turns classified task types into ordered, provider-bound steps.
import { selectProvider } from "./providers.server";
import { rolesForTaskType } from "./router.server";
import type { AiPlanStep, AiProviderDescriptor, AiProviderRole, AiTaskType } from "./types";

const ROLE_TITLES: Record<AiProviderRole, string> = {
  planner: "Идеяны талдау және құрылым жоспарлау",
  coder: "Беттер мен логиканы генерациялау",
  designer: "Дизайн жүйесін таңдау",
  image: "Визуал контент дайындау",
  video: "Видео контент дайындау",
  "3d": "3D / анимация дайындау",
  voice: "Дауыстық контент дайындау",
  validator: "Нәтижені тексеру",
};

export function buildSteps(
  taskTypes: AiTaskType[],
  providers: AiProviderDescriptor[],
): AiPlanStep[] {
  const seen = new Set<string>();
  const steps: AiPlanStep[] = [];

  for (const taskType of taskTypes) {
    for (const role of rolesForTaskType(taskType)) {
      const key = `${role}:${taskType}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const provider = selectProvider(role, taskType, providers);
      steps.push({
        order: steps.length + 1,
        taskType,
        role,
        providerId: provider?.id ?? null,
        providerLabel: provider?.label ?? "Провайдер табылмады",
        providerStatus: provider?.status ?? "unavailable",
        title: ROLE_TITLES[role],
        estimatedCredits: provider?.creditsPerStep ?? 0,
        state: "queued",
      });
    }
  }

  return steps;
}
