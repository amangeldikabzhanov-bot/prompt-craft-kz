import { Link } from "@tanstack/react-router";
import { Blocks, Compass, LayoutGrid, Sparkles, Terminal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/ai-tools", label: "AI Tools", icon: LayoutGrid },
  { to: "/ai-finder", label: "AI Finder", icon: Compass },
  { to: "/prompts", label: "Prompts", icon: Terminal },
  { to: "/projects", label: "Projects", icon: Blocks },
  { to: "/builder", label: "Builder", icon: Sparkles },
];

export function Navbar() {
  return (
    <>
      {/* Desktop / tablet */}
      <header className="sticky top-0 z-40 hidden w-full border-b border-border/60 bg-background/70 backdrop-blur-xl md:block">
        <nav className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-6 py-3">
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="animate-pulse-glow grid size-9 place-items-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Sparkles className="size-4.5" />
            </span>
            <span className="font-display text-lg font-bold tracking-tight">
              Vibe<span className="text-gradient">Coding</span> KZ
            </span>
          </Link>

          <div className="mx-auto flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{
                  className:
                    "border-primary/50 bg-primary/10 text-foreground shadow-[var(--shadow-glow)]",
                }}
                inactiveProps={{ className: "border-transparent text-muted-foreground" }}
                className="flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium transition-all duration-300 hover:border-border hover:bg-surface/70 hover:text-foreground"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </div>

          <Link
            to="/builder"
            className="shrink-0 rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            Builder-ді бастау
          </Link>
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display truncate text-base font-bold">
              Vibe<span className="text-gradient">Coding</span> KZ
            </span>
          </Link>
          <Link
            to="/builder"
            className="shrink-0 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-glow"
          >
            Builder
          </Link>
        </div>
      </header>
    </>
  );
}

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
      <ul className="grid grid-cols-5">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              activeProps={{ className: "text-primary-glow" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className="group relative flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium transition-colors duration-300 active:scale-95"
            >
              {({ isActive }) => (
                <>
                  <span
                    className={
                      "grid size-9 place-items-center rounded-xl transition-all duration-300 " +
                      (isActive
                        ? "bg-primary/15 shadow-[var(--shadow-glow)]"
                        : "bg-transparent group-hover:bg-surface/70")
                    }
                  >
                    <item.icon className="size-5" />
                  </span>
                  <span className="max-w-full truncate">{item.label}</span>
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
