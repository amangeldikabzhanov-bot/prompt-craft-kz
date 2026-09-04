import { useCallback, useEffect, useState } from "react";

/**
 * Free plan rule: each user gets ONE free template use.
 * Tracked locally (no payment system in this step).
 */
const KEY = "vibecoding-kz:free-template-use";

interface FreeUse {
  templateId: string;
  at: string;
}

function read(): FreeUse | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FreeUse) : null;
  } catch {
    return null;
  }
}

export function useTemplateAccess() {
  const [freeUse, setFreeUse] = useState<FreeUse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setFreeUse(read());
    setReady(true);
  }, []);

  const consumeFreeUse = useCallback((templateId: string) => {
    const next: FreeUse = { templateId, at: new Date().toISOString() };
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore private mode */
    }
    setFreeUse(next);
  }, []);

  return {
    ready,
    freeUsed: Boolean(freeUse),
    freeTemplateId: freeUse?.templateId ?? null,
    consumeFreeUse,
  };
}
