// Builds a starter project scaffold (Vite + React + TS) from a saved project row.
// Server-only: never imported from client code directly.
import { zipSync, strToU8 } from "fflate";

export interface ExportProjectInput {
  name: string;
  description: string | null;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  blueprint: unknown;
}

export function sanitizeFileName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\-_ ]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();
  return (cleaned || "project").slice(0, 60);
}

function slugAscii(name: string): string {
  const ascii = name.replace(/[^a-zA-Z0-9\-_ ]/g, "").trim().replace(/\s+/g, "-").toLowerCase();
  return ascii || "vibecoding-project";
}

interface Blueprint {
  name: string;
  description: string;
  pages: string[];
  features: string[];
  techNotes: string;
}

function readBlueprint(value: unknown): Blueprint | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const strings = (x: unknown) =>
    Array.isArray(x) ? x.filter((i): i is string => typeof i === "string") : [];
  return {
    name: typeof v['name'] === "string" ? v['name'] : "",
    description: typeof v['description'] === "string" ? v['description'] : "",
    pages: strings(v['pages']),
    features: strings(v['features']),
    techNotes: typeof v['techNotes'] === "string" ? v['techNotes'] : "",
  };
}

function pageComponentName(page: string, index: number): string {
  const ascii = page.replace(/[^a-zA-Z0-9]/g, "");
  return ascii ? `${ascii[0]!.toUpperCase()}${ascii.slice(1)}` : `Page${index + 1}`;
}

export function sanitizeRepoName(name: string): string {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\-_.]/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");
  return (cleaned || "vibecoding-project").slice(0, 90);
}

/** Returns the full text file map for the project scaffold. */
export function buildProjectFiles(project: ExportProjectInput): Record<string, string> {
  const blueprint = readBlueprint(project.blueprint);
  const slug = slugAscii(project.name);
  const pages = blueprint?.pages.length ? blueprint.pages : ["Басты бет"];
  const features = blueprint?.features ?? [];
  const description = blueprint?.description || project.description || "";

  const pageFiles: Record<string, string> = {};
  const imports: string[] = [];
  const sections: string[] = [];

  pages.forEach((page, i) => {
    const comp = pageComponentName(page, i);
    imports.push(`import ${comp} from "./pages/${comp}";`);
    sections.push(`      <${comp} />`);
    pageFiles[`src/pages/${comp}.tsx`] = `export default function ${comp}() {
  return (
    <section className="page">
      <h2>${page}</h2>
      <p>Бұл бөлімнің мазмұнын осында толтырыңыз.</p>
    </section>
  );
}
`;
  });

  const files: Record<string, string> = {
    "README.md": `# ${project.name}

${description}

- Статус: ${project.status}
- Құрылды: ${project.createdAt ?? "-"}
- Жаңартылды: ${project.updatedAt ?? "-"}

## Беттер
${pages.map((p) => `- ${p}`).join("\n")}

## Функциялар
${features.length ? features.map((f) => `- ${f}`).join("\n") : "- (әзірге жоқ)"}

${blueprint?.techNotes ? `## Техникалық ескертпелер\n\n${blueprint.techNotes}\n` : ""}
## Іске қосу

\`\`\`bash
npm install
npm run dev
\`\`\`

VibeCoding KZ арқылы жасалды.
`,
    "package.json": `${JSON.stringify(
      {
        name: slug,
        private: true,
        version: "0.1.0",
        type: "module",
        scripts: { dev: "vite", build: "tsc -b && vite build", preview: "vite preview" },
        dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
        devDependencies: {
          "@vitejs/plugin-react": "^4.3.4",
          typescript: "^5.7.2",
          vite: "^6.0.0",
        },
      },
      null,
      2,
    )}\n`,
    "index.html": `<!doctype html>
<html lang="kk">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${project.name}</title>
    <meta name="description" content="${description.replace(/"/g, "'").slice(0, 150)}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
    "vite.config.ts": `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });
`,
    "tsconfig.json": `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "bundler",
          jsx: "react-jsx",
          strict: true,
          skipLibCheck: true,
          noEmit: true,
        },
        include: ["src"],
      },
      null,
      2,
    )}\n`,
    ".gitignore": "node_modules\ndist\n.DS_Store\n",
    "public/robots.txt": "User-agent: *\nAllow: /\n",
    "src/main.tsx": `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`,
    "src/App.tsx": `${imports.join("\n")}

export default function App() {
  return (
    <main className="app">
      <header className="hero">
        <h1>${project.name}</h1>
        <p>${description.replace(/</g, "&lt;")}</p>
      </header>
${sections.join("\n")}
    </main>
  );
}
`,
    "src/styles.css": `:root { color-scheme: dark; }
body { margin: 0; font-family: system-ui, sans-serif; background: #05070f; color: #e8ecf8; }
.app { max-width: 960px; margin: 0 auto; padding: 32px 20px 64px; }
.hero h1 { font-size: clamp(1.75rem, 5vw, 2.75rem); margin: 0 0 8px; }
.hero p { color: #9aa4c2; margin: 0 0 32px; }
.page { border: 1px solid #1c2440; border-radius: 18px; padding: 20px; margin-bottom: 16px; background: #0a0f1f; }
.page h2 { margin: 0 0 6px; font-size: 1.1rem; }
.page p { margin: 0; color: #9aa4c2; font-size: 0.9rem; }
`,
    "blueprint.json": `${JSON.stringify(project.blueprint ?? null, null, 2)}\n`,
    ...pageFiles,
  };

  return files;
}

/** Returns { fileName, bytes } for the project's zip archive. */
export function buildProjectZip(project: ExportProjectInput) {
  const files = buildProjectFiles(project);
  const zipInput: Record<string, Uint8Array> = {};
  for (const [path, content] of Object.entries(files)) {
    zipInput[path] = strToU8(content);
  }

  return {
    fileName: `${sanitizeFileName(project.name)}.zip`,
    bytes: zipSync(zipInput, { level: 6 }),
  };
}
