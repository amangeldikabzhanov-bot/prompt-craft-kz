import { useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";

/** Remounts children on route change so the entrance animation replays. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div key={pathname} className="animate-page-in">
      {children}
    </div>
  );
}
