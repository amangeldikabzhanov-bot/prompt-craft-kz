import { useState } from "react";
import { useInspector } from "@/hooks/useInspector";
import { InspectorModal } from "@/components/InspectorModal";
import { cn } from "@/lib/utils";

const LABELS = {
  idle: { dot: "bg-muted-foreground", text: "Inspector: Дайын", tone: "text-muted-foreground" },
  scanning: { dot: "bg-warning animate-pulse", text: "Inspector: Тексеруде...", tone: "text-warning" },
  secure: { dot: "bg-success", text: "Inspector: Қауіпсіз", tone: "text-success" },
  risk: { dot: "bg-destructive animate-pulse", text: "Inspector: Қауіп бар", tone: "text-destructive" },
} as const;

export function InspectorBadge({ compact = false }: { compact?: boolean }) {
  const { status } = useInspector();
  const [open, setOpen] = useState(false);
  const meta = LABELS[status];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={meta.text}
        title={meta.text}
        className={cn(
          "press flex shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface/50 font-medium transition-colors hover:border-primary/40",
          meta.tone,
          compact ? "px-2 py-1.5 text-[11px]" : "px-3 py-2 text-xs",
        )}
      >
        <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
        <span className={compact ? "hidden sm:inline" : "hidden xl:inline"}>{meta.text}</span>
      </button>
      <InspectorModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
