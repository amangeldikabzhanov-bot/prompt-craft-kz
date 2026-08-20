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
      <header className="sticky top-0 z-40 hidden w-full border-b border-border/50 bg-background/60 backdrop-blur-xl md:block">
        <nav className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-6 py-3">
          <Link to="/" className="press group flex shrink-0 items-center gap-2.5">
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
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="group relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-300"
              >
                {({ isActive }) => (
                  <>
                    {/* Premium active / hover surface */}
                    <span
                      className={
                        "absolute inset-0 rounded-xl border transition-all duration-300 " +
                        (isActive
                          ? "border-primary/45 bg-primary/10 opacity-100 shadow-[var(--shadow-glow)]"
                          : "border-transparent bg-surface/0 opacity-0 group-hover:border-border group-hover:bg-surface/60 group-hover:opacity-100")
                      }
                    />
                    <item.icon className="relative size-4 transition-transform duration-300 group-hover:-translate-y-px" />
                    <span className="relative transition-transform duration-300 group-hover:-translate-y-px">
                      {item.label}
                    </span>
                    {/* Active underline indicator */}
                    <span
                      className={
                        "absolute -bottom-[7px] left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-[image:var(--gradient-primary)] transition-all duration-300 " +
                        (isActive ? "w-8 opacity-100" : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-60")
                      }
                    />
                  </>
                )}
              </Link>
            ))}
          </div>

          <Link
            to="/builder"
            className="press group relative shrink-0 overflow-hidden rounded-xl bg-[image:var(--gradient-primary)] px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110"
          >
            <span className="relative inline-flex items-center gap-1.5">
              <Sparkles className="size-4" />
              Builder-ді бастау
            </span>
          </Link>
        </nav>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/" className="press flex min-w-0 items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground">
              <Sparkles className="size-4" />
            </span>
            <span className="font-display truncate text-base font-bold">
              Vibe<span className="text-gradient">Coding</span> KZ
            </span>
          </Link>
          <Link
            to="/builder"
            className="press shrink-0 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary-glow"
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
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)] md:hidden">
      <nav className="glass pointer-events-auto mx-auto max-w-md rounded-3xl shadow-[var(--shadow-card)]">
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="min-w-0">
              <Link
                to={item.to}
                activeProps={{ className: "text-primary-glow" }}
                inactiveProps={{ className: "text-muted-foreground" }}
                className="group relative flex flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium transition-colors duration-300 active:scale-95"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={
                        "grid size-9 place-items-center rounded-2xl transition-all duration-300 " +
                        (isActive
                          ? "scale-105 bg-primary/15 shadow-[var(--shadow-glow)]"
                          : "scale-100 bg-transparent")
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
    </div>
  );
}
