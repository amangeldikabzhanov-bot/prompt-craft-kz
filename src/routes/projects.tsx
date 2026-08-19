import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Rocket } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { LoadingState } from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/lib/projects";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — жобаларың | VibeCoding KZ" },
      {
        name: "description",
        content: "AI жобаларыңды бір жерде басқар: статус, прогресс және соңғы жаңарту.",
      },
      { property: "og:title", content: "Жобалар дашборды — VibeCoding KZ" },
      { property: "og:description", content: "AI жобаларыңның прогресін бақыла." },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { projects, loading, addProject } = useProjects();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!name.trim()) {
      toast.error("Жоба атауын жаз");
      return;
    }
    addProject({ name: name.trim(), description: description.trim() || "Сипаттама әлі жоқ." });
    toast.success("Жоба құрылды");
    setName("");
    setDescription("");
    setOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader
        eyebrow="Дашборд"
        title="Менің жобаларым"
        description="Барлық AI жобаларың бір жерде."
        actions={
          <Button variant="hero" size="lg" onClick={() => setOpen(true)}>
            <Plus /> Жоба құру
          </Button>
        }
      />

      {loading ? (
        <LoadingState count={3} />
      ) : projects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      ) : (
        <div className="surface-card animate-rise rounded-4xl px-6 py-16 text-center">
          <span className="animate-float mx-auto grid size-16 place-items-center rounded-3xl bg-[image:var(--gradient-primary)] text-primary-foreground">
            <Rocket className="size-7" />
          </span>
          <h2 className="mt-6 text-xl font-bold sm:text-2xl">Алғашқы AI жобаңа бастау бер.</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Builder-де бір сөйлем жаз — жобаң осында пайда болады.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="hero" size="lg">
              <Link to="/builder">Builder-ді бастау</Link>
            </Button>
            <Button variant="glass" size="lg" onClick={() => setOpen(true)}>
              <Plus /> Қолмен құру
            </Button>
          </div>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass rounded-3xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Жаңа жоба</DialogTitle>
            <DialogDescription>Жобаңа атау бер және не жасайтыныңды жаз.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="p-name">Атауы</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Мысалы: Кофехана сайты"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Сипаттама</Label>
              <Textarea
                id="p-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Не жасағың келеді?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Болдырмау
            </Button>
            <Button variant="hero" onClick={submit}>
              Құру
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
