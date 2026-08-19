/**
 * Minimal localization scaffold.
 * Primary locale: Kazakh. RU / EN can be added by extending `dictionaries`.
 */
export type Locale = "kz" | "ru" | "en";

export const DEFAULT_LOCALE: Locale = "kz";

export const dictionaries = {
  kz: {
    brand: "VibeCoding KZ",
    nav: {
      tools: "AI Tools",
      finder: "AI Finder",
      prompts: "Prompts",
      projects: "Projects",
      builder: "Builder",
    },
    common: {
      search: "Іздеу...",
      copy: "Көшіру",
      copied: "Көшірілді",
      save: "Сақтау",
      saved: "Сақталды",
      all: "Барлығы",
      nothingFound: "Ештеңе табылмады",
    },
  },
} satisfies Record<string, unknown>;

export type Dictionary = (typeof dictionaries)["kz"];

export function useT(locale: Locale = DEFAULT_LOCALE): Dictionary {
  return (dictionaries as Record<string, Dictionary>)[locale] ?? dictionaries.kz;
}
