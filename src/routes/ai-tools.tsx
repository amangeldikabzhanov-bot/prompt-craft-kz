import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS, TOOL_CATEGORIES, type ToolCategory } from "@/data/tools";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/ai-tools")({
  head: () => ({
    meta: [
      { title: "AI Tools — VibeCoding KZ" },
      {
        name: "description",
        content: "Сайт жасау, дизайн, видео, автоматтандыру және кодқа арналған AI құралдар каталогы.",
      },
      { property: "og:title", content: "AI құралдар каталогы — VibeCoding KZ" },
      { property: "og:description", content: "Категориялар бойынша сұрыпталған AI құралдар." },
    ],
  }),
  component: AiToolsPage,
});

function AiToolsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((t) => {
      const inCat = category === "all" || t.category === category;
      if (!inCat) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.includes(q)) ||
        t.tags.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Каталог"
        title="AI құралдар"
        description="Қажетті құралды категория бойынша тап немесе іздеу арқылы сүз."
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Мысалы: сайт, видео, чат-бот..."
        size="lg"
        className="max-w-xl"
      />

      <div className="scrollbar-none mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["all", ...TOOL_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c as ToolCategory | "all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-all duration-300",
              category === c
                ? "border-primary/50 bg-primary/15 text-primary-glow shadow-[var(--shadow-glow)]"
                : "border-border bg-surface/50 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c === "all" ? "Барлығы" : c}
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs text-muted-foreground">{results.length} құрал табылды</p>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        <div className="surface-card mt-4 rounded-3xl p-12 text-center">
          <p className="text-sm text-muted-foreground">Ештеңе табылмады. Басқа сөзбен көріңіз.</p>
        </div>
      )}
    </div>
  );
}
