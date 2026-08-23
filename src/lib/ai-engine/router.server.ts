// AI Router — classifies a prompt into task types and maps them to provider roles.
import type { AiProviderRole, AiTaskType } from "./types";

const KEYWORDS: Record<AiTaskType, string[]> = {
  coding: [
    "сайт", "қосымша", "app", "код", "code", "api", "форма", "form", "backend",
    "дүкен", "shop", "лендинг", "landing", "бот", "bot", "интеграция",
  ],
  reasoning: ["жоспар", "талда", "стратегия", "analyz", "plan", "идея", "кеңес"],
  design: ["дизайн", "design", "ui", "ux", "стиль", "түс", "color", "лого", "logo", "макет"],
  image: ["сурет", "image", "фото", "photo", "иллюстрация", "баннер", "banner"],
  video: ["видео", "video", "ролик", "анимациялық ролик", "reels"],
  "3d": ["3d", "3д", "модель", "анимация", "animation"],
  voice: ["дауыс", "voice", "аудио", "audio", "озвуч", "speech", "подкаст"],
  testing: ["тест", "test", "тексер", "qa", "валидац", "debug", "қате"],
};

export function classifyTaskTypes(prompt: string): AiTaskType[] {
  const text = prompt.toLowerCase();
  const hits = (Object.keys(KEYWORDS) as AiTaskType[]).filter((type) =>
    KEYWORDS[type].some((kw) => text.includes(kw)),
  );
  return hits.length > 0 ? hits : ["coding"];
}

export function primaryTaskType(types: AiTaskType[]): AiTaskType {
  const priority: AiTaskType[] = [
    "coding", "design", "image", "video", "3d", "voice", "reasoning", "testing",
  ];
  return priority.find((t) => types.includes(t)) ?? "coding";
}

export function rolesForTaskType(type: AiTaskType): AiProviderRole[] {
  switch (type) {
    case "coding":
      return ["planner", "coder", "validator"];
    case "design":
      return ["designer"];
    case "image":
      return ["image"];
    case "video":
      return ["video"];
    case "3d":
      return ["3d"];
    case "voice":
      return ["voice"];
    case "testing":
      return ["validator"];
    case "reasoning":
    default:
      return ["planner"];
  }
}
