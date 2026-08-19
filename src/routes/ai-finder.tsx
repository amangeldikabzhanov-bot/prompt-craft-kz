import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { ToolCard } from "@/components/ToolCard";
import { TOOLS } from "@/data/tools";
import { findTools, SUGGESTIONS } from "@/lib/finder";

export const Route = createFileRoute("/ai-finder")({
  head: () => ({
    meta: [
      { title: "AI Finder — керек құралды тап | VibeCoding KZ" },
      {
        name: "description",
        content:
          "Қазақша, орысша немесе ағылшынша жаз — саған керек AI құралын тауып береміз. Ватсап, чат-бот, сайт, дүкен.",
      },
      { property: "og:title", content: "AI Finder — VibeCoding KZ" },
      { property: "og:description", content: "Саған керек AI құралын бір сөзбен тап." },
    ],
  }),
  component: AiFinderPage,
});

function AiFinderPage() {
  const [query, setQuery] = useState("");
  const { tools, categories } = useMemo(() => findTools(query), [query]);
  const list = query.trim() ? tools : TOOLS.slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <PageHeader
        eyebrow="Smart search"
        title="Саған керек AI құралын тап."
        description="Қазақша, орысша немесе ағылшынша жаз — біз синонимдерді де танимыз."
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="ватсап, чат-бот, дүкен, сайт, видео..."
        size="lg"
        autoFocus
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuery(s)}
            className="rounded-full border border-border bg-surface/50 px-3 py-1.5 text-xs text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary-glow"
          >
            {s}
          </button>
        ))}
      </div>

      {query.trim() && categories.length > 0 && (
        <div className="animate-rise glass mt-8 rounded-3xl p-5">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="size-4 text-primary-glow" />
            Ұсынылған категориялар
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary-glow"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      <h2 className="mt-10 mb-4 text-sm font-semibold text-muted-foreground">
        {query.trim() ? `${list.length} сәйкес құрал` : "Танымал ұсыныстар"}
      </h2>

      {list.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      ) : (
        <div className="surface-card rounded-3xl p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Ештеңе табылмады. Мысалы «ватсап» немесе «сайт» деп көріңіз.
          </p>
        </div>
      )}
    </div>
  );
}
