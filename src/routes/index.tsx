import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/components/Navbar";
import { TOOLS } from "@/data/tools";
import { ToolCard } from "@/components/ToolCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeCoding KZ — Идеяңды жаз, AI жобаңды жасасын" },
      {
        name: "description",
        content:
          "AI құралдарын тап, дайын промпттарды қолдан, жобаларыңды басқар және идеяңды нақты өнімге айналдыр.",
      },
      { property: "og:title", content: "VibeCoding KZ — AI платформасы" },
      {
        property: "og:description",
        content: "Қазақ тіліндегі AI құралдары, промпттар және AI Builder.",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  {
    title: "Идеяңды жаз",
    text: "Қарапайым сөзбен не жасағың келетінін сипатта.",
  },
  { title: "AI құрастырады", text: "Builder құрылымды, дизайнды және мазмұнды дайындайды." },
  { title: "Жобаңды басқар", text: "Прогресті бақыла, жаңарт және іске қос." },
];

function Index() {
  const featured = TOOLS.slice(0, 6);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="animate-rise min-w-0">
          <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-primary-glow">
            <span className="animate-pulse-glow h-1.5 w-1.5 rounded-full bg-primary" />
            Қазақ тіліндегі AI платформасы
          </span>

          <h1 className="mt-5 text-4xl leading-[1.05] font-bold text-balance sm:text-5xl lg:text-6xl">
            Идеяңды жаз — <span className="text-gradient">AI жобаңды жасасын.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            AI құралдарын тап, дайын промпттарды қолдан, жобаларыңды басқар және идеяңды нақты
            өнімге айналдыр.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="hero" size="xl">
              <Link to="/builder">
                Builder-ді бастау <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/ai-tools">AI құралдарын көру</Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[
              { k: `${TOOLS.length}+`, v: "AI құрал" },
              { k: "14+", v: "Дайын промпт" },
              { k: "5", v: "Негізгі бөлім" },
            ].map((s) => (
              <div key={s.v} className="min-w-0">
                <dt className="font-display text-2xl font-bold text-foreground">{s.k}</dt>
                <dd className="truncate text-xs text-muted-foreground">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Animated AI orb */}
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="animate-pulse-glow absolute inset-8 rounded-full bg-[image:var(--gradient-primary)] opacity-30 blur-[70px]" />
          <div className="animate-spin-slow absolute inset-4 rounded-full border border-primary/25" />
          <div className="animate-spin-slow absolute inset-12 rounded-full border border-violet/25 [animation-direction:reverse]" />
          <div className="animate-float glass absolute inset-20 grid place-items-center rounded-full">
            <Sparkles className="size-12 text-primary-glow" />
          </div>
          <div className="animate-float glass absolute top-6 right-2 rounded-2xl px-3 py-2 text-xs [animation-delay:-3s]">
            <span className="text-primary-glow">◆</span> Сайт жасау
          </div>
          <div className="animate-float glass absolute bottom-10 left-0 rounded-2xl px-3 py-2 text-xs [animation-delay:-6s]">
            <Zap className="mr-1 inline size-3 text-violet" /> WhatsApp бот
          </div>
        </div>
      </section>

      {/* Nav shortcuts */}
      <section className="py-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {NAV_ITEMS.map((item, i) => (
            <Link
              key={item.to}
              to={item.to}
              style={{ animationDelay: `${i * 60}ms` }}
              className="animate-rise surface-card group flex flex-col gap-3 rounded-3xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[var(--shadow-glow)]"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary-glow transition-colors group-hover:bg-primary/20">
                <item.icon className="size-5" />
              </span>
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="py-14 sm:py-20">
        <h2 className="text-2xl font-bold sm:text-3xl">Қалай жұмыс істейді</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              style={{ animationDelay: `${i * 80}ms` }}
              className="animate-rise surface-card rounded-3xl p-6"
            >
              <span className="font-display text-sm text-primary-glow">0{i + 1}</span>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured tools */}
      <section className="pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold sm:text-3xl">Танымал AI құралдар</h2>
          <Link
            to="/ai-tools"
            className="shrink-0 text-sm font-medium text-primary-glow hover:underline"
          >
            Барлығы
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mb-16">
        <div className="surface-card relative overflow-hidden rounded-4xl px-6 py-12 text-center sm:px-12">
          <div className="animate-pulse-glow pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]" />
          <h2 className="relative text-2xl font-bold text-balance sm:text-4xl">
            Алғашқы AI жобаңа бастау бер.
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Бір сөйлем жаз — Builder қалғанын өзі жасайды.
          </p>
          <Button asChild variant="hero" size="xl" className="relative mt-7">
            <Link to="/builder">
              Builder-ді бастау <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
