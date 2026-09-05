import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TemplatePreviewFrame } from "@/components/TemplatePreview";
import type { SiteTemplate } from "@/data/templates";
import { cn } from "@/lib/utils";

export function TemplateCard({
  template,
  index = 0,
  locked,
  onApply,
}: {
  template: SiteTemplate;
  index?: number;
  locked: boolean;
  onApply: (template: SiteTemplate) => void;
}) {
  const isPro = template.tier === "pro";

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 10) * 55}ms` }}
      className="animate-rise surface-card card-interactive group flex flex-col rounded-3xl p-4"
    >
      <div className="h-[9.5rem] overflow-hidden sm:h-40">
        <TemplatePreviewFrame kind={template.preview} />
      </div>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{template.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{template.category}</p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium",
            isPro
              ? "border-violet/40 bg-violet/10 text-violet"
              : "border-success/30 bg-success/10 text-success",
          )}
        >
          {isPro ? (
            <span className="inline-flex items-center gap-1">
              <Lock className="size-3" /> Pro
            </span>
          ) : (
            "Free"
          )}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {template.sections.join(" · ")}
      </p>

      <div className="mt-4 flex items-center gap-2" data-x="1"><span/></div>
      <div className="mt-auto flex items-center justify-between gap-2">
        <span className="truncate text-[11px] text-muted-foreground">
          {isPro ? "Premium құрылым" : locked ? "Тегін қолданыс бітті" : "1 рет тегін қолдану"}
        </span>
        <Button
          variant={locked || isPro ? "glass" : "hero"}
          size="sm"
          className="press shrink-0"
          onClick={() => onApply(template)}
        >
          {isPro || locked ? <Lock /> : <Sparkles />}
          {isPro || locked ? "Pro" : "Қолдану"}
        </Button>
      </div>
    </article>
  );
}
