import { useState } from "react";
import { Bookmark, BookmarkCheck, Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { Prompt } from "@/data/prompts";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PromptCard({
  prompt,
  index = 0,
  saved,
  onToggleSave,
}: {
  prompt: Prompt;
  index?: number;
  saved: boolean;
  onToggleSave: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.text);
      setCopied(true);
      toast.success("Промпт көшірілді");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Көшіру мүмкін болмады");
    }
  };

  return (
    <article
      style={{ animationDelay: `${Math.min(index, 12) * 55}ms` }}
      className="animate-rise surface-card card-interactive group flex flex-col rounded-3xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-base font-semibold">{prompt.title}</h3>
        <span className="shrink-0 rounded-full border border-violet/30 bg-violet/10 px-2.5 py-1 text-[11px] font-medium text-violet">
          {prompt.category}
        </span>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{prompt.description}</p>

      <p className="mt-4 line-clamp-3 rounded-2xl border border-border bg-surface/50 p-3 font-mono text-xs leading-relaxed text-muted-foreground">
        {prompt.text}
      </p>

      <div className="mt-5 flex items-center gap-2">
        <Button size="sm" variant="glass" className="press flex-1" onClick={copy}>
          {copied ? <Check className="text-success" /> : <Copy />}
          {copied ? "Көшірілді" : "Көшіру"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Сақтау"
          onClick={() => onToggleSave(prompt.id)}
          className={cn("press px-3 transition-transform duration-300", saved && "scale-110 text-primary-glow")}
        >
          {saved ? <BookmarkCheck /> : <Bookmark />}
        </Button>
      </div>
    </article>
  );
}
