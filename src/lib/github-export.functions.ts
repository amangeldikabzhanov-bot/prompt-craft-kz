import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import {
  appUserReconnectRequired,
  authorizeAppUserOAuth,
  callAsAppUser,
  exchangeAppUserOAuthCode,
} from "@/integrations/lovable/appUserConnector";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getConnectionKeyForUser,
  saveConnectionKeyForUser,
} from "@/server/appUserConnections.server";

const GATEWAY_BASE_URL = "https://connector-gateway.lovable.dev";
const CONNECTOR_ID = "github";
const GITHUB_SCOPES = ["read:user", "repo"];

function clientApiKey(): string {
  const key = process.env['GITHUB_APP_USER_CONNECTOR_CLIENT_API_KEY'];
  if (!key) throw new Error("GITHUB_APP_USER_CONNECTOR_CLIENT_API_KEY is not set");
  return key;
}

export const startGitHubConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const request = getRequest();
    if (!request) throw new Error("OAuth must start from an app request.");
    const url = new URL(request.url);
    const sandboxHost =
      url.hostname === "localhost" ? request.headers.get("x-forwarded-host") : null;
    const returnUrl = new URL(
      "/oauth/github/return",
      sandboxHost ? `https://${sandboxHost}` : url.origin,
    ).toString();

    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);

    const { authorizationUrl } = await authorizeAppUserOAuth({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectorId: CONNECTOR_ID,
      appUserId: context.userId,
      clientAPIKey: clientApiKey(),
      returnUrl,
      connectionAPIKey: connectionAPIKey ?? undefined,
      credentialsConfiguration: { scopes: GITHUB_SCOPES },
    });
    return { authorizationUrl };
  });

export const completeGitHubConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ code: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    const { connectionAPIKey, connectorId } = await exchangeAppUserOAuthCode(
      GATEWAY_BASE_URL,
      data.code,
    );
    if (connectorId !== CONNECTOR_ID) {
      throw new Error("OAuth completion returned the wrong connector");
    }
    await saveConnectionKeyForUser(context.userId, connectorId, connectionAPIKey);
    return { ok: true };
  });

export type GitHubConnectionStatus =
  | { connected: true; login: string }
  | { connected: false; reconnectRequired?: boolean };

export const getGitHubConnectionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<GitHubConnectionStatus> => {
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) return { connected: false };

    const res = await callAsAppUser({
      gatewayBaseUrl: GATEWAY_BASE_URL,
      connectionAPIKey,
      connectorId: CONNECTOR_ID,
      path: "/user",
      init: { method: "GET", headers: { Accept: "application/vnd.github+json" } },
      requiredScopes: GITHUB_SCOPES,
    });
    if (await appUserReconnectRequired(res)) {
      return { connected: false, reconnectRequired: true };
    }
    if (!res.ok) {
      console.error(`[github] /user failed [${res.status}]: ${await res.text()}`);
      return { connected: false };
    }
    const user = (await res.json()) as { login?: string };
    return { connected: true, login: user.login ?? "github-user" };
  });

const exportInput = z.object({
  projectId: z.string().uuid(),
  repoName: z.string().min(1).max(100),
  isPrivate: z.boolean(),
});

export type GitHubExportResult =
  | { ok: true; repoUrl: string }
  | {
      ok: false;
      code: "not_connected" | "reconnect_required" | "not_found" | "github_error" | "internal";
      message: string;
    };

export const exportProjectToGitHub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => exportInput.parse(input))
  .handler(async ({ data, context }): Promise<GitHubExportResult> => {
    const connectionAPIKey = await getConnectionKeyForUser(context.userId, CONNECTOR_ID);
    if (!connectionAPIKey) {
      return { ok: false, code: "not_connected", message: "Алдымен GitHub аккаунтыңызды байланыстырыңыз." };
    }

    // RLS scopes this read to the caller's own projects.
    const { data: row, error } = await context.supabase
      .from("projects")
      .select("id, name, description, status, blueprint, created_at, updated_at")
      .eq("id", data.projectId)
      .maybeSingle();

    if (error) {
      console.error("[github-export] project read failed", error);
      return { ok: false, code: "internal", message: "Жоба жүктелмеді." };
    }
    if (!row) {
      return { ok: false, code: "not_found", message: "Жоба табылмады." };
    }

    const gh = async (path: string, init?: RequestInit): Promise<Response> =>
      callAsAppUser({
        gatewayBaseUrl: GATEWAY_BASE_URL,
        connectionAPIKey,
        connectorId: CONNECTOR_ID,
        path,
        init: {
          ...init,
          headers: { Accept: "application/vnd.github+json", ...(init?.headers ?? {}) },
        },
        requiredScopes: GITHUB_SCOPES,
      });

    try {
      const { buildProjectFiles, sanitizeRepoName } = await import("./project-export.server");
      const repoName = sanitizeRepoName(data.repoName);
      const files = buildProjectFiles({
        name: row.name,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        blueprint: row.blueprint,
      });

      const createRes = await gh("/user/repos", {
        method: "POST",
        body: JSON.stringify({
          name: repoName,
          private: data.isPrivate,
          description: (row.description ?? "").slice(0, 300) || undefined,
          auto_init: true,
        }),
      });
      if (await appUserReconnectRequired(createRes)) {
        return { ok: false, code: "reconnect_required", message: "GitHub рұсатын жаңарту қажет." };
      }
      if (!createRes.ok) {
        const body = await createRes.text();
        console.error(`[github-export] create repo failed [${createRes.status}]: ${body}`);
        if (createRes.status === 422) {
          return { ok: false, code: "github_error", message: "Мұндай атты репозиторий бар немесе атау қате." };
        }
        return { ok: false, code: "github_error", message: `GitHub қатесі [${createRes.status}].` };
      }
      const repo = (await createRes.json()) as { full_name: string; html_url: string };

      for (const [path, content] of Object.entries(files)) {
        const putRes = await gh(`/repos/${repo.full_name}/contents/${path}`, {
          method: "PUT",
          body: JSON.stringify({
            message: `Add ${path} (VibeCoding KZ export)`,
            content: btoa(unescape(encodeURIComponent(content))),
          }),
        });
        if (!putRes.ok) {
          const body = await putRes.text();
          console.error(`[github-export] upload ${path} failed [${putRes.status}]: ${body}`);
          return {
            ok: false,
            code: "github_error",
            message: `Файл жүктелмеді: ${path}. Репозиторий жасалды, бірақ толық емес.`,
          };
        }
      }

      return { ok: true, repoUrl: repo.html_url };
    } catch (err) {
      console.error("[github-export] failed", err);
      return { ok: false, code: "internal", message: "Экспорт сәтсіз аяқталды. Қайта көріңіз." };
    }
  });
