import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/signup")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Тіркелу — VibeCoding KZ" },
      {
        name: "description",
        content: "VibeCoding KZ-ге тіркел: идеяларыңды AI жобаларына айналдыр және сақта.",
      },
      { property: "og:title", content: "Тіркелу — VibeCoding KZ" },
      { property: "og:description", content: "Идеяларыңды AI жобаларына айналдыр." },
    ],
  }),
  component: SignupPage,
});

function safePath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/projects";
}

function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const target = safePath(search.redirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!authLoading && user) void navigate({ to: target, replace: true });
  }, [authLoading, user, target, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Email дұрыс емес.");
      return;
    }
    if (password.length < 6) {
      setError("Құпиясөз кемінде 6 таңба болуы керек.");
      return;
    }
    if (password !== confirm) {
      setError("Құпиясөздер сәйкес келмейді.");
      return;
    }
    setSubmitting(true);
    const { data, error: err } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setSubmitting(false);
    if (err) {
      setError(
        err.message.toLowerCase().includes("already")
          ? "Бұл email тіркелген. Кіріп көр."
          : err.message,
      );
      return;
    }
    if (data.session) {
      void navigate({ to: target, replace: true });
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <AuthShell
        title="Пошта жіберілді."
        subtitle="Email-іңді ашып, растау сілтемесін бас."
        footer={
          <Link to="/login" className="font-semibold text-primary-glow hover:underline">
            Кіру бетіне
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="animate-success-pop grid size-14 place-items-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="size-7" />
          </span>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">{email}</span> адресіне растау хаты кетті.
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="VibeCoding KZ-ге қосыл."
      subtitle="Идеяларыңды AI жобаларына айналдыр."
      footer={
        <>
          Аккаунтың бар ма?{" "}
          <Link
            to="/login"
            search={{ redirect: search.redirect }}
            className="font-semibold text-primary-glow hover:underline"
          >
            Кіру
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="sen@mail.kz"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Құпиясөз</Label>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Кемінде 6 таңба"
              className="pr-11"
              required
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Құпиясөзді жасыру" : "Құпиясөзді көрсету"}
              className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Құпиясөзді қайтала</Label>
          <Input
            id="confirm"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitting ? "Тіркеліп жатырмыз..." : "Тіркелу"}
        </Button>
      </form>
    </AuthShell>
  );
}
