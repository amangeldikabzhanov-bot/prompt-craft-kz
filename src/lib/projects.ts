import { useCallback, useEffect, useState } from "react";
import type { Project, ProjectStatus } from "@/components/ProjectCard";

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

/** Client-side project store. Swap the read/write layer for Lovable Cloud later. */
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(read());
      setLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const persist = useCallback((next: Project[]) => {
    setProjects(next);
    write(next);
  }, []);

  const addProject = useCallback(
    (input: { name: string; description: string; status?: ProjectStatus; progress?: number }) => {
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
    [],
  );

  const clearAll = useCallback(() => persist([]), [persist]);

  return { projects, loading, addProject, clearAll };
}

export function createProjectFromPrompt(prompt: string) {
  const name = prompt.trim().split(/[.\n]/)[0]?.slice(0, 46) || "Жаңа AI жоба";
  const project: Project = {
    id: `p-${Date.now()}`,
    name,
    description: prompt.trim().slice(0, 140),
    status: "building",
    updatedAt: "Жаңа ғана",
    progress: 45,
  };
  if (typeof window !== "undefined") {
    const next = [project, ...read()];
    write(next);
  }
  return project;
}
