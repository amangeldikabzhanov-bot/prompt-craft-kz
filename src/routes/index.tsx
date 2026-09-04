import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Plus, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/components/Navbar";
import { AiCore } from "@/components/AiCore";
import { TemplateCard } from "@/components/TemplateCard";
import { HERO_SUGGESTIONS, TEMPLATES, type SiteTemplate } from "@/data/templates";
import { useTemplateAccess } from "@/lib/templateUsage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeCoding KZ — Идеядан дайын сайтқа" },
      {
        name: "description",
        content:
          "AI көмегімен идеяңыздан сайт жасаңыз: бос шаблондарды таңдап, Builder-де AI-мен толтырыңыз.",
      },
      { property: "og:title", content: "VibeCoding KZ — AI сайт жасау платформасы" },
      {
        property: "og:description",
        content: "Дайын бос шаблондар, AI чат және Builder — идеядан дайын сайтқа.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const { ready, freeUsed, consumeFreeUse } = useTemplateAccess();

  const goBuilder = (prompt: string, templateId?: string) => {
    const search: { prompt?: string; template?: string } = {};
    if (prompt.trim()) search.prompt = prompt.trim();
    if (templateId) search.template = templateId;
    void navigate({ to: "/builder", search });
  };

  const submitIdea = () => {
    if (idea.trim().length < 3) {
      toast.error("Идеяңызды жазыңыз");
      return;
    }
    goBuilder(idea);
  };

  const applyTemplate = (template: SiteTemplate) => {
    if (template.tier === "pro") {
      toast("🔒 Pro шаблон", {
        description: "Premium шаблондар Pro жоспарында ашылады.",
      });
      return;
    }
    if (freeUsed) {
      toast("Тегін қолданыс бітті", {
        description: "Тегін жоспарда 1 шаблон беріледі. Қалғаны Pro жоспарда.",
      });
      return;
    }
    consumeFreeUse(template.id);
    toast.success(`${template.name} шаблоны таңдалды`);
    goBuilder(template.starter, template.id);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative overflow-x-clip py-12 sm:py-16 lg:py-20">
        <div
          aria-hidden
          className="animate-aurora pointer-events-none absolute -top-16 left-1/2 h-[24rem] w-[38rem] max-w-[130vw] -translate-x-1/2 rounded-full bg-[image:var(--gradient-primary)] opacity-20 blur-[120px]"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          <AiCore state="idle" size="md" className="mx-auto" />
          <span className="glass mt-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-primary-glow">
            <span className="animate-pulse-glow h-1.5 w-1.5 rounded-full bg-primary" />
            Қазақ тіліндегі AI платформасы
          </span>

          <h1 className="mt-5 text-[2.35rem] leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-6xl">
            Идеядан — <span className="text-gradient">дайын сайтқа</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            AI көмегімен өз идеяңыздағы сайтты жасаңыз.
          </p>

          {/* AI input */}
          <div className="glass animate-rise mt-8 rounded-3xl p-2.5 text-left transition-shadow duration-300 focus-within:shadow-[var(--shadow-glow)] sm:p-3">
            <div className="flex items-center gap-2">
              <span className="hidden shrink-0 grid-cols-1 place-items-center rounded-2xl bg-primary/10 p-2.5 text-primary-glow sm:grid">
                <Sparkles className="size-4" />
              </span>
              <input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitIdea();
                }}
                maxLength={300}
                placeholder="Не жасағыңыз келеді?"
                aria-label="Не жасағыңыз келеді?"
                className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-base"
              />
              <Button
                variant="hero"
                size="lg"
                className="press shrink-0"
                onClick={submitIdea}
                aria-label="Builder-ге жіберу"
              >
                <Send />
                <span className="hidden sm:inline">Бастау</span>
              </Button>
            </div>

            {/* Future: AI recommendation → accept or add another AI */}
            <div className="mt-2 flex items-center gap-2 border-t border-border/60 px-1 pt-2">
              <span className="truncate text-[11px] text-muted-foreground">
                AI ұсынысы: авто таңдау
              </span>
              <button
                type="button"
                aria-label="Басқа AI қосу"
                onClick={() =>
                  toast("Көп AI таңдау жақында", {
                    description: "Қазір Builder автоматты түрде ең қолайлы AI-ды таңдайды.",
                  })
                }
                className="ml-auto grid size-7 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {HERO_SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setIdea(s)}
                className="glass press rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section className="py-8 sm:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold sm:text-3xl">Дайын бос шаблондар</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Бастапқы құрылымды таңдаңыз да, қалғанын өзіңіз AI көмегімен толтырыңыз.
            </p>
          </div>
          <span className="glass shrink-0 rounded-full px-3 py-1.5 text-xs text-muted-foreground">
            {ready && freeUsed ? "Тегін қолданыс бітті" : "1 рет тегін қолдану"}
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t, i) => (
            <TemplateCard
              key={t.id}
              template={t}
              index={i}
              locked={t.tier === "pro" || freeUsed}
              onApply={applyTemplate}
            />
          ))}
        </div>
      </section>

      {/* Sections shortcuts */}
      <section className="py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-rise surface-card card-interactive group flex flex-col gap-3 rounded-3xl p-4"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary-glow transition-colors group-hover:bg-primary/20">
                <item.icon className="size-5" />
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="my-12 sm:my-16">
        <div className="surface-card relative overflow-hidden rounded-4xl px-6 py-12 text-center sm:px-12">
          <div className="animate-pulse-glow pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
          <h2 className="relative text-2xl font-bold text-balance sm:text-4xl">
            Шаблонды таңдаңыз — AI қалғанын жасайды.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Бос құрылым Builder-де ашылады, ал мазмұнды сіз AI-ға айтасыз.
          </p>
          <Button asChild variant="hero" size="xl" className="press relative mt-7">
            <Link to="/builder">
              Builder-ді бастау <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
