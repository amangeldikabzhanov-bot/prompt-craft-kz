import { useCallback, useEffect, useState } from "react";
import type { Project, ProjectStatus } from "@/components/ProjectCard";
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
}

function fromRow(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    status: (["draft", "building", "ready"].includes(row.status) ? row.status : "draft") as ProjectStatus,
    updatedAt: formatUpdated(row.updated_at),
    progress: row.progress,
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
      .select("id, name, description, status, progress, updated_at")
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
          .select("id, name, description, status, progress, updated_at")
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
      .select("id, name, description, status, progress, updated_at")
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
