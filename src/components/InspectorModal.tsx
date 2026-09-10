import { useState } from "react";
import { AlertTriangle, Check, Loader2, RefreshCw, ScrollText, ShieldCheck, X } from "lucide-react";
import { useInspector } from "@/hooks/useInspector";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function gradeTone(grade: string) {
  if (grade.startsWith("A")) return "text-success";
  if (grade.startsWith("B") || grade.startsWith("C")) return "text-warning";
  return "text-destructive";
}

export function InspectorModal({ isOpen, onClose }: Props) {
  const { status, report, logs, isolated, rescan } = useInspector();
  const [showLogs, setShowLogs] = useState(false);
  const [rescanning, setRescanning] = useState(false);

  if (!isOpen) return null;

  const handleRescan = async () => {
    if (rescanning) return;
    setRescanning(true);
    try {
      await rescan();
    } finally {
      setRescanning(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="surface-card max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="AI Inspector қауіпсіздік аудиті"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="size-5 shrink-0 text-primary-glow" />
            <h3 className="truncate text-base font-semibold sm:text-lg">AI Inspector аудиті</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Жабу"
            className="press shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {!report ? (
          <p className="mt-5 text-sm text-muted-foreground">
            Әзірге тексеру жүргізілген жоқ. Builder-де код генерациялағанда Inspector автоматты
            түрде іске қосылады.
          </p>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Score */}
            <div className="glass rounded-2xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Қауіпсіздік ұпайы</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">
                {report.score}
                <span className="text-base text-muted-foreground">/100</span>
              </p>
              <p className={cn("mt-1 text-sm font-semibold", gradeTone(report.grade))}>
                Баға: {report.grade}
              </p>
            </div>

            {isolated ? (
              <div className="flex gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-3 text-xs leading-relaxed text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <span className="min-w-0">
                  Оқшаулау режимі қосулы: қауіп жойылғанша ZIP және GitHub экспорты уақытша
                  өшірілді.
                </span>
              </div>
            ) : null}

            {/* Checklist */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Аудит тізімі</p>
              <ul className="space-y-2">
                {report.checks.map((check) => (
                  <li
                    key={check.id}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface/40 px-3 py-2.5"
                  >
                    <span className="min-w-0 truncate text-xs">{check.label}</span>
                    <span
                      className={cn(
                        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        check.passed
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive",
                      )}
                    >
                      {check.passed ? <Check className="size-3" /> : <AlertTriangle className="size-3" />}
                      {check.passed ? "Таза" : `${check.findings} қауіп`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {report.findings.length > 0 ? (
              <ul className="space-y-2">
                {report.findings.map((f, i) => (
                  <li
                    key={`${f.check}-${i}`}
                    className="rounded-2xl border border-warning/25 bg-warning/5 p-3"
                  >
                    <p className="text-xs font-semibold">{f.title}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      {f.detail}
                    </p>
                    {f.evidence ? (
                      <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                        {f.evidence}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Black box hash */}
            <div className="rounded-2xl border border-border bg-surface/40 p-3">
              <p className="text-[11px] text-muted-foreground">Black Box лог хэші</p>
              <p className="mt-1 truncate font-mono text-xs text-primary-glow">{report.hash}</p>
            </div>

            {showLogs ? (
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Black Box логтары</p>
                {logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Лог жазбалары жоқ.</p>
                ) : (
                  <ul className="space-y-1.5">
                    {logs.map((log) => (
                      <li
                        key={`${log.hash}-${log.at}`}
                        className="rounded-xl border border-border bg-surface/40 px-3 py-2"
                      >
                        <p className="truncate font-mono text-[10px] text-muted-foreground">
                          {log.hash}
                        </p>
                        <p className="mt-0.5 flex flex-wrap gap-x-2 text-[10px] text-muted-foreground">
                          <span>{new Date(log.at).toLocaleString("kk-KZ")}</span>
                          <span>· {log.source}</span>
                          <span>· {log.score}/100 ({log.grade})</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => void handleRescan()}
                disabled={rescanning || status === "scanning"}
                className="press inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[image:var(--gradient-primary)] px-3 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {rescanning || status === "scanning" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Кодты қайта тексеру
              </button>
              <button
                onClick={() => setShowLogs((v) => !v)}
                className="press inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-surface/60"
              >
                <ScrollText className="size-4" />
                {showLogs ? "Логтарды жасыру" : "Black Box логтары"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
