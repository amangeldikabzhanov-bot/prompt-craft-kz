import { useCallback, useEffect, useState } from "react";
import type { Project, ProjectBlueprint, ProjectStatus } from "@/components/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "vibecoding-kz:projects";

export const SEED_PROJECTS: Project[] = [
  {
    id: "seed-1",
    name: "Ресторан сайты",
    description: "Меню, үстел брондау және WhatsApp батырмасы бар лендинг.",
    status: "ready",
    updatedAt: "2 күн бұрын",
    progress: 100,
  },
  {
    id: "seed-2",
    name: "Гүл дүкені",
    description: "Онлайн каталог пен жеткізу формасы.",
    status: "building",
    updatedAt: "Бүгін",
    progress: 62,
  },
];

function read(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Project[]) : SEED_PROJECTS;
  } catch {
    return SEED_PROJECTS;
  }
}

function write(projects: Project[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    /* ignore quota / private mode */
  }
}

function formatUpdated(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const day = 86_400_000;
  if (diff < 60_000) return "Жаңа ғана";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} мин бұрын`;
  if (diff < day) return "Бүгін";
  return `${Math.floor(diff / day)} күн бұрын`;
}

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number;
  updated_at: string;
  created_at?: string;
  blueprint?: unknown;
}

const ROW_COLUMNS = "id, name, description, status, progress, updated_at, created_at, blueprint";

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("kk-KZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function toBlueprint(value: unknown): ProjectBlueprint | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  return {
    name: typeof v['name'] === "string" ? v['name'] : "",
    description: typeof v['description'] === "string" ? v['description'] : "",
    pages: Array.isArray(v['pages']) ? (v['pages'] as unknown[]).filter((p): p is string => typeof p === "string") : [],
    features: Array.isArray(v['features'])
      ? (v['features'] as unknown[]).filter((p): p is string => typeof p === "string")
      : [],
    techNotes: typeof v['techNotes'] === "string" ? v['techNotes'] : "",
  };
}

function fromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    status: (["draft", "building", "ready"].includes(row.status) ? row.status : "draft") as ProjectStatus,
    updatedAt: formatUpdated(row.updated_at),
    progress: row.progress,
    createdAtLabel: formatDate(row.created_at),
    updatedAtLabel: formatDate(row.updated_at),
    blueprint: toBlueprint(row.blueprint),
  };
}


/** Projects store: Lovable Cloud for signed-in users, local storage for guests. */
export function useProjects() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(null);

    if (!user) {
      const timer = setTimeout(() => {
        if (!active) return;
        setProjects(read());
        setLoading(false);
      }, 300);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }

    void supabase
      .from("projects")
      .select(ROW_COLUMNS)
      .order("updated_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError("Жобалар жүктелмеді.");
        else setProjects(((data ?? []) as ProjectRow[]).map(fromRow));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user, authLoading]);

  const addProject = useCallback(
    async (input: { name: string; description: string; status?: ProjectStatus; progress?: number }) => {
      if (user) {
        const { data, error: err } = await supabase
          .from("projects")
          .insert({
            user_id: user.id,
            name: input.name,
            description: input.description,
            status: input.status ?? "draft",
            progress: input.progress ?? 10,
          })
          .select(ROW_COLUMNS)
          .single();
        if (err || !data) throw new Error("Жоба сақталмады.");
        const project = fromRow(data as ProjectRow);
        setProjects((prev) => [project, ...prev]);
        return project;
      }

      const project: Project = {
        id: `p-${Date.now()}`,
        name: input.name,
        description: input.description,
        status: input.status ?? "draft",
        updatedAt: "Жаңа ғана",
        progress: input.progress ?? 10,
      };
      setProjects((prev) => {
        const next = [project, ...prev];
        write(next);
        return next;
      });
      return project;
    },
    [user],
  );

  return { projects, loading, error, addProject, isAuthed: Boolean(user) };
}

/** Creates a project from a Builder prompt. Persists to Cloud when signed in. */
export async function createProjectFromPrompt(prompt: string, userId?: string | null) {
  const name = prompt.trim().split(/[.\n]/)[0]?.slice(0, 46) || "Жаңа AI жоба";
  const description = prompt.trim().slice(0, 140);

  if (userId) {
    const { data, error } = await supabase
      .from("projects")
      .insert({ user_id: userId, name, description, status: "building", progress: 45 })
      .select(ROW_COLUMNS)
      .single();
    if (!error && data) return fromRow(data as ProjectRow);
  }

  const project: Project = {
    id: `p-${Date.now()}`,
    name,
    description,
    status: "building",
    updatedAt: "Жаңа ғана",
    progress: 45,
  };
  if (typeof window !== "undefined") {
    write([project, ...read()]);
  }
  return project;
}

/** Persists an AI blueprint as a real project for the signed-in user. */
export async function createProjectFromBlueprint(
  userId: string,
  blueprint: ProjectBlueprint,
  prompt: string,
): Promise<Project> {
  const name = blueprint.name.trim() || prompt.trim().split(/[.\n]/)[0]?.slice(0, 46) || "Жаңа AI жоба";
  const description = blueprint.description.trim() || prompt.trim().slice(0, 140);

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      name: name.slice(0, 120),
      description,
      status: "ready",
      progress: 100,
      blueprint: { ...blueprint, prompt },
    })
    .select(ROW_COLUMNS)
    .single();

  if (error || !data) throw new Error("Жоба сақталмады.");
  return fromRow(data as ProjectRow);
}

/** Loads one project owned by the signed-in user (RLS scoped). */
export function useProject(id: string) {
  const { user, loading: authLoading } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    let active = true;
    setLoading(true);
    setError(null);

    if (!user) {
      const local = read().find((p) => p.id === id) ?? null;
      if (!local) setError("Бұл жобаны көру үшін аккаунтқа кір.");
      setProject(local);
      setLoading(false);
      return;
    }

    void supabase
      .from("projects")
      .select(ROW_COLUMNS)
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: err }) => {
        if (!active) return;
        if (err) setError("Жоба жүктелмеді.");
        else if (!data) setError("Жоба табылмады.");
        else setProject(fromRow(data as ProjectRow));
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, user, authLoading]);

  return { project, loading, error };
}
