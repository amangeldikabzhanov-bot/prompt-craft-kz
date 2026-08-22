import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { PromptCard } from "@/components/PromptCard";
import { PROMPTS, PROMPT_CATEGORIES, type PromptCategory } from "@/data/prompts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/prompts")({
  head: () => ({
    meta: [
      { title: "Prompts — дайын AI промпттар | VibeCoding KZ" },
      {
        name: "description",
        content: "Сайт, бизнес, маркетинг, дизайн және кодқа арналған қазақша дайын промпттар.",
      },
      { property: "og:title", content: "Промпт кітапханасы — VibeCoding KZ" },
      { property: "og:description", content: "Көшір де қолдан: қазақша AI промпттар." },
    ],
  }),
  component: PromptsPage,
});

function PromptsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<PromptCategory | "all">("all");
  const [saved, setSaved] = useState<string[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setSaved([]);
      return;
    }
    let active = true;
    void supabase
      .from("saved_prompts")
      .select("prompt_id")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Сақталған промпттар жүктелмеді.");
        else setSaved((data ?? []).map((r) => r.prompt_id));
      });
    return () => {
      active = false;
    };
  }, [user]);

  const toggleSave = (id: string) => {
    const wasSaved = saved.includes(id);
    setSaved((prev) => (wasSaved ? prev.filter((p) => p !== id) : [...prev, id]));

    if (!user) {
      if (!wasSaved) toast("Тұрақты сақтау үшін аккаунтқа кір.");
      return;
    }

    void (async () => {
      const { error } = wasSaved
        ? await supabase.from("saved_prompts").delete().eq("prompt_id", id).eq("user_id", user.id)
        : await supabase.from("saved_prompts").insert({ user_id: user.id, prompt_id: id });
      if (error) {
        setSaved((prev) => (wasSaved ? [...prev, id] : prev.filter((p) => p !== id)));
        toast.error("Сақталмады. Қайта көр.");
      }
    })();
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROMPTS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q)
      );
    });
  }, [query, category]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Кітапхана"
        title="Дайын промпттар"
        description="Көшір, өз мәліметіңді қой және кез келген AI-да қолдан."
      />

      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Промпт іздеу..."
        size="lg"
        className="max-w-xl"
      />

      <div className="mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {(["all", ...PROMPT_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c as PromptCategory | "all")}
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

      <p className="mt-5 text-xs text-muted-foreground">
        {results.length} промпт · {saved.length} сақталған
      </p>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((prompt, i) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              index={i}
              saved={saved.includes(prompt.id)}
              onToggleSave={toggleSave}
            />
          ))}
        </div>
      ) : (
        <div className="surface-card mt-4 rounded-3xl p-12 text-center">
          <p className="text-sm text-muted-foreground">Ештеңе табылмады.</p>
        </div>
      )}
    </div>
  );
}
