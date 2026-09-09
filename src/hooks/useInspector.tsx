import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  scanContent,
  type InspectorInput,
  type InspectorReport,
  type InspectorStatus,
} from "@/lib/inspector/scanner";

const LOG_KEY = "vibecoding-kz:blackbox";
const MAX_LOGS = 25;

export interface BlackBoxLog {
  hash: string;
  at: string;
  source: string;
  score: number;
  grade: string;
  findings: number;
}

interface InspectorContextValue {
  status: InspectorStatus;
  report: InspectorReport | null;
  logs: BlackBoxLog[];
  /** True when a risk was found — exports must stay disabled. */
  isolated: boolean;
  scan: (input: InspectorInput) => Promise<InspectorReport | null>;
  rescan: () => Promise<InspectorReport | null>;
  clearLogs: () => void;
}

const InspectorContext = createContext<InspectorContextValue>({
  status: "idle",
  report: null,
  logs: [],
  isolated: false,
  scan: async () => null,
  rescan: async () => null,
  clearLogs: () => {},
});

function readLogs(): BlackBoxLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as BlackBoxLog[]) : [];
  } catch {
    return [];
  }
}

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<InspectorStatus>("idle");
  const [report, setReport] = useState<InspectorReport | null>(null);
  const [logs, setLogs] = useState<BlackBoxLog[]>([]);
  const lastInput = useRef<InspectorInput | null>(null);

  useEffect(() => {
    setLogs(readLogs());
  }, []);

  const scan = useCallback(async (input: InspectorInput) => {
    lastInput.current = input;
    setStatus("scanning");
    try {
      const next = await scanContent(input);
      setReport(next);
      setStatus(next.status);
      setLogs((prev) => {
        const entry: BlackBoxLog = {
          hash: next.hash,
          at: next.scannedAt,
          source: next.source,
          score: next.score,
          grade: next.grade,
          findings: next.findings.length,
        };
        const updated = [entry, ...prev].slice(0, MAX_LOGS);
        try {
          window.localStorage.setItem(LOG_KEY, JSON.stringify(updated));
        } catch {
          /* ignore quota */
        }
        return updated;
      });
      return next;
    } catch {
      setStatus(report ? report.status : "idle");
      return null;
    }
  }, [report]);

  const rescan = useCallback(async () => {
    if (!lastInput.current) return null;
    return scan(lastInput.current);
  }, [scan]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    try {
      window.localStorage.removeItem(LOG_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<InspectorContextValue>(
    () => ({ status, report, logs, isolated: status === "risk", scan, rescan, clearLogs }),
    [status, report, logs, scan, rescan, clearLogs],
  );

  return <InspectorContext.Provider value={value}>{children}</InspectorContext.Provider>;
}

export function useInspector() {
  return useContext(InspectorContext);
}
