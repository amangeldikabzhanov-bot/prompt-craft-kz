import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, ExternalLink, Github, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  completeGitHubConnection,
  exportProjectToGitHub,
  getGitHubConnectionStatus,
  startGitHubConnect,
} from "@/lib/github-export.functions";
import { cn } from "@/lib/utils";

interface GitHubExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

function waitForOAuthCompletion(popup: Window) {
  return new Promise<string | null>((resolve, reject) => {
    let poll: number | undefined;
    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      if (poll !== undefined) window.clearInterval(poll);
    };
    const onMessage = (event: MessageEvent) => {
      const type = event.data?.type;
      if (
        event.origin !== window.location.origin ||
        event.source !== popup ||
        event.data?.connectorId !== "github" ||
        (type !== "appUserConnectorOAuthComplete" && type !== "appUserConnectorOAuthFailed")
      )
        return;
      cleanup();
      if (type === "appUserConnectorOAuthComplete") {
        resolve(typeof event.data?.code === "string" ? event.data.code : null);
        return;
      }
      popup.close();
      reject(new Error("GitHub байланысы сәтсіз аяқталды."));
    };
    window.addEventListener("message", onMessage);
    poll = window.setInterval(() => {
      if (!popup.closed) return;
      cleanup();
      reject(new Error("GitHub терезесі жабылды."));
    }, 500);
  });
}

export function GitHubExportModal({ isOpen, onClose, projectId, projectName }: GitHubExportModalProps) {
  const fetchStatus = useServerFn(getGitHubConnectionStatus);
  const startConnect = useServerFn(startGitHubConnect);
  const completeConnect = useServerFn(completeGitHubConnection);
  const runExport = useServerFn(exportProjectToGitHub);

  const [statusLoading, setStatusLoading] = useState(false);
  const [login, setLogin] = useState<string | null>(null);
  const [reconnectRequired, setReconnectRequired] = useState(false);
  const [repoName, setRepoName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const status = await fetchStatus();
      if (status.connected) {
        setLogin(status.login);
        setReconnectRequired(false);
      } else {
        setLogin(null);
        setReconnectRequired(status.reconnectRequired ?? false);
      }
    } catch {
      setLogin(null);
    } finally {
      setStatusLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    if (!isOpen) return;
    setRepoName(
      projectName
        .normalize("NFKD")
        .replace(/[^\p{L}\p{N}\-_.]/gu, "-")
        .replace(/-+/g, "-")
        .replace(/^[-.]+|[-.]+$/g, "")
        .toLowerCase()
        .slice(0, 90) || "vibecoding-project",
    );
    setRepoUrl(null);
    setError(null);
    void refreshStatus();
  }, [isOpen, projectName, refreshStatus]);

  if (!isOpen) return null;

  async function handleConnect() {
    if (connecting) return;
    setConnecting(true);
    setError(null);
    const popup = window.open("", "lovable-oauth", "width=600,height=720");
    if (!popup) {
      setConnecting(false);
      setError("Терезе бұғатталды. Pop-up-қа рұқсат беріңіз.");
      return;
    }
    try {
      const { authorizationUrl } = await startConnect();
      const completion = waitForOAuthCompletion(popup);
      popup.location.href = authorizationUrl;
      const code = await completion;
      if (code) await completeConnect({ data: { code } });
      await refreshStatus();
      toast.success("GitHub байланыстырылды");
    } catch (err) {
      popup.close();
      setError(err instanceof Error ? err.message : "GitHub байланысы сәтсіз аяқталды.");
    } finally {
      setConnecting(false);
    }
  }

  async function handleExport() {
    if (exporting || !login) return;
    setExporting(true);
    setError(null);
    setRepoUrl(null);
    try {
      const res = await runExport({
        data: { projectId, repoName: repoName.trim() || "vibecoding-project", isPrivate },
      });
      if (!res.ok) {
        if (res.code === "not_connected" || res.code === "reconnect_required") {
          setLogin(null);
          setReconnectRequired(res.code === "reconnect_required");
        }
        setError(res.message);
        return;
      }
      setRepoUrl(res.repoUrl);
      toast.success("Репозиторий жасалды");
    } catch {
      setError("Экспорт сәтсіз аяқталды. Қайта көріңіз.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="surface-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Github className="size-5" />
            <h3 className="text-lg font-semibold">GitHub-қа экспорттау</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Жабу"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          {statusLoading ? (
            <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> GitHub байланысы тексерілуде…
            </p>
          ) : login ? (
            <p className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs text-success">
              <Check className="size-3.5" /> Байланысқан: {login}
            </p>
          ) : (
            <div className="space-y-2">
              {reconnectRequired ? (
                <p className="text-xs text-warning">GitHub рұсатын жаңарту қажет.</p>
              ) : null}
              <button
                onClick={handleConnect}
                disabled={connecting}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2/70 px-4 py-2.5 text-sm transition-colors hover:bg-surface-2"
              >
                {connecting ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
                {reconnectRequired ? "GitHub-ты қайта байланыстыру" : "GitHub-ты байланыстыру"}
              </button>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Репозиторий атауы</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="my-vibe-app"
              className="w-full rounded-xl border border-border bg-surface-2/70 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Көріну режимі</label>
            <div className="flex gap-4 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="gh-visibility"
                  checked={!isPrivate}
                  onChange={() => setIsPrivate(false)}
                  className="accent-primary"
                />
                <span>Public</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="gh-visibility"
                  checked={isPrivate}
                  onChange={() => setIsPrivate(true)}
                  className="accent-primary"
                />
                <span>Private</span>
              </label>
            </div>
          </div>

          {error ? <p className="text-xs text-destructive">{error}</p> : null}

          {repoUrl ? (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-success/30 bg-success/10 px-3 py-2 text-xs text-success"
            >
              <Check className="size-3.5" /> Жүктелді — репозиторийді ашу
              <ExternalLink className="size-3" />
            </a>
          ) : null}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="w-1/3 rounded-xl border border-border py-2.5 text-sm transition-colors hover:bg-surface-2/70"
          >
            Жабу
          </button>
          <button
            onClick={handleExport}
            disabled={!login || exporting || statusLoading}
            className={cn(
              "flex w-2/3 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
              (!login || exporting || statusLoading) && "cursor-not-allowed opacity-50",
            )}
          >
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Github className="size-4" />}
            {exporting ? "Жүктелуде…" : "Push to GitHub"}
          </button>
        </div>
      </div>
    </div>
  );
}
