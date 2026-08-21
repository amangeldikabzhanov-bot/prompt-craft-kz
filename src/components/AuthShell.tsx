import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-4 py-12 sm:py-16">
      <div className="animate-rise surface-card rounded-4xl p-6 sm:p-8">
        <span className="animate-pulse-glow mx-auto grid size-12 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-primary-foreground">
          <Sparkles className="size-5" />
        </span>
        <h1 className="font-display mt-5 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </div>
      <div className="animate-rise mt-5 text-center text-sm text-muted-foreground">{footer}</div>
    </div>
  );
}
