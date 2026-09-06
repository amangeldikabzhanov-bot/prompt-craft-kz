import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const exportInput = z.object({ projectId: z.string().uuid() });

export type ExportProjectZipResult =
  | { ok: true; fileName: string; base64: string }
  | { ok: false; code: "not_found" | "internal"; message: string };

export const exportProjectZip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => exportInput.parse(input))
  .handler(async ({ data, context }): Promise<ExportProjectZipResult> => {
    // RLS scopes this read to the caller's own projects.
    const { data: row, error } = await context.supabase
      .from("projects")
      .select("id, name, description, status, blueprint, created_at, updated_at")
      .eq("id", data.projectId)
      .maybeSingle();

    if (error) {
      console.error("[export] project read failed", error);
      return { ok: false, code: "internal", message: "Жоба жүктелмеді." };
    }
    if (!row) {
      return { ok: false, code: "not_found", message: "Жоба табылмады." };
    }

    try {
      const { buildProjectZip } = await import("./project-export.server");
      const { fileName, bytes } = buildProjectZip({
        name: row.name,
        description: row.description,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        blueprint: row.blueprint,
      });

      let binary = "";
      const chunk = 0x8000;
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      return { ok: true, fileName, base64: btoa(binary) };
    } catch (err) {
      console.error("[export] zip build failed", err);
      return { ok: false, code: "internal", message: "ZIP жасалмады." };
    }
  });
