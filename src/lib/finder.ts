import { TOOLS, type AiTool, type ToolCategory } from "@/data/tools";

/** Common KZ / RU / EN spelling variants mapped to canonical search terms. */
const SYNONYMS: Record<string, string[]> = {
  ватсап: ["whatsapp", "wa", "чат-бот", "автоматтандыру"],
  вотсап: ["whatsapp", "wa", "чат-бот"],
  васап: ["whatsapp", "wa"],
  whatsapp: ["whatsapp", "wa", "чат-бот"],
  wa: ["whatsapp", "чат-бот"],
  "чат-бот": ["чат-бот", "chatbot", "бот"],
  чатбот: ["чат-бот", "chatbot", "бот"],
  chatbot: ["чат-бот", "бот"],
  бот: ["чат-бот", "бот"],
  дүкен: ["дүкен", "магазин", "shop", "ecommerce", "сайт"],
  дукен: ["дүкен", "магазин", "shop"],
  магазин: ["дүкен", "shop", "ecommerce"],
  сайт: ["сайт", "site", "web", "лендинг"],
  site: ["сайт", "web"],
  лендинг: ["лендинг", "landing", "сайт"],
  landing: ["лендинг", "сайт"],
  видео: ["видео", "бейне", "video", "reels"],
  бейне: ["видео", "video"],
  сурет: ["сурет", "image", "фото"],
  фото: ["сурет", "image"],
  дизайн: ["дизайн", "design", "ui"],
  код: ["код", "code", "dev"],
  маркетинг: ["маркетинг", "smm", "реклама", "жарнама"],
  жарнама: ["маркетинг", "реклама", "жарнама"],
  smm: ["маркетинг", "smm", "reels"],
  crm: ["crm", "автоматтандыру"],
  мәтін: ["мәтін", "текст", "assistant"],
  текст: ["мәтін", "текст"],
};

export const SUGGESTIONS = [
  "ватсап",
  "чат-бот",
  "сайт",
  "дүкен",
  "лендинг",
  "видео",
  "сурет",
  "код",
];

function expand(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const words = q.split(/[\s,]+/).filter(Boolean);
  const terms = new Set<string>(words);
  for (const w of words) {
    for (const [key, values] of Object.entries(SYNONYMS)) {
      if (key.includes(w) || w.includes(key)) values.forEach((v) => terms.add(v));
    }
  }
  return [...terms];
}

function score(tool: AiTool, terms: string[]): number {
  const haystack = [
    tool.name.toLowerCase(),
    tool.category.toLowerCase(),
    tool.description.toLowerCase(),
    ...tool.tags.map((t) => t.toLowerCase()),
    ...tool.keywords.map((k) => k.toLowerCase()),
  ];
  let total = 0;
  for (const term of terms) {
    if (tool.name.toLowerCase().includes(term)) total += 5;
    if (tool.keywords.some((k) => k.toLowerCase() === term)) total += 4;
    if (haystack.some((h) => h.includes(term))) total += 2;
  }
  return total;
}

export function findTools(query: string): { tools: AiTool[]; categories: ToolCategory[] } {
  const terms = expand(query);
  if (terms.length === 0) return { tools: [], categories: [] };

  const ranked = TOOLS.map((tool) => ({ tool, s: score(tool, terms) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s);

  const tools = ranked.map((r) => r.tool);
  const categories = [...new Set(tools.map((t) => t.category))].slice(0, 4);
  return { tools, categories };
}
