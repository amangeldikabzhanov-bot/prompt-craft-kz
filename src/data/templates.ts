/**
 * Empty structural website templates.
 * They intentionally contain NO business content — only page structure,
 * which the user fills later with AI inside Builder.
 */

export type TemplateTier = "free" | "pro";

/** Lightweight CSS preview kinds (no WebGL / no heavy 3D). */
export type TemplatePreview = "grid" | "hero" | "list" | "split" | "showcase" | "feed" | "gallery" | "panels";

export interface SiteTemplate {
  id: string;
  name: string;
  category: string;
  tier: TemplateTier;
  preview: TemplatePreview;
  /** Empty structural sections — no fixed business copy. */
  sections: string[];
  /** Neutral starter instruction handed to Builder (structure only). */
  starter: string;
}

export const TEMPLATES: SiteTemplate[] = [
  {
    id: "ecommerce",
    name: "E-commerce",
    category: "Дүкен",
    tier: "free",
    preview: "grid",
    sections: ["Басты бет", "Каталог", "Тауар беті", "Себет", "Тапсырыс"],
    starter:
      "Бос E-commerce құрылымы: басты бет, каталог, тауар беті, себет, тапсырыс. Мазмұнды мен беремін.",
  },
  {
    id: "coffee-shop",
    name: "Coffee Shop",
    category: "Кафе",
    tier: "free",
    preview: "split",
    sections: ["Басты бет", "Мәзір", "Орын брондау", "Байланыс"],
    starter: "Бос Coffee Shop құрылымы: басты бет, мәзір, брондау, байланыс. Мазмұнды мен беремін.",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    category: "Мейрамхана",
    tier: "free",
    preview: "showcase",
    sections: ["Басты бет", "Мәзір", "Үстел брондау", "Галерея", "Байланыс"],
    starter:
      "Бос Restaurant құрылымы: басты бет, мәзір, үстел брондау, галерея, байланыс. Мазмұнды мен беремін.",
  },
  {
    id: "business",
    name: "Business",
    category: "Бизнес",
    tier: "free",
    preview: "panels",
    sections: ["Басты бет", "Қызметтер", "Біз туралы", "Бағалар", "Байланыс"],
    starter:
      "Бос Business сайтының құрылымы: басты бет, қызметтер, біз туралы, бағалар, байланыс. Мазмұнды мен беремін.",
  },
  {
    id: "game-landing",
    name: "Game Landing",
    category: "Лендинг",
    tier: "pro",
    preview: "hero",
    sections: ["Hero", "Трейлер", "Мүмкіндіктер", "Жүктеу", "Қауымдастық"],
    starter:
      "Бос Game Landing құрылымы: hero, трейлер блогы, мүмкіндіктер, жүктеу, қауымдастық. Мазмұнды мен беремін.",
  },
  {
    id: "blog",
    name: "Blog",
    category: "Блог",
    tier: "free",
    preview: "feed",
    sections: ["Басты бет", "Мақалалар тізімі", "Мақала беті", "Санаттар", "Автор"],
    starter:
      "Бос Blog құрылымы: басты бет, мақалалар тізімі, мақала беті, санаттар, автор. Мазмұнды мен беремін.",
  },
  {
    id: "portfolio",
    name: "Portfolio",
    category: "Портфолио",
    tier: "free",
    preview: "gallery",
    sections: ["Басты бет", "Жұмыстар", "Жоба беті", "Мен туралы", "Байланыс"],
    starter:
      "Бос Portfolio құрылымы: басты бет, жұмыстар галереясы, жоба беті, мен туралы, байланыс. Мазмұнды мен беремін.",
  },
  {
    id: "agency",
    name: "Agency",
    category: "Агенттік",
    tier: "pro",
    preview: "list",
    sections: ["Hero", "Қызметтер", "Кейстер", "Команда", "Брифт формасы"],
    starter:
      "Бос Agency құрылымы: hero, қызметтер, кейстер, команда, бриф формасы. Мазмұнды мен беремін.",
  },
];

export function getTemplate(id: string | undefined | null): SiteTemplate | undefined {
  if (!id) return undefined;
  return TEMPLATES.find((t) => t.id === id);
}

export const HERO_SUGGESTIONS = [
  "Сайт жасау",
  "Интернет дүкен",
  "Landing page",
  "Блог",
  "Портфолио",
  "Қызмет көрсету",
];
