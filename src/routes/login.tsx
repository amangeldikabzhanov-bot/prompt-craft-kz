import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Кіру — VibeCoding KZ workspace" },
      {
        name: "description",
        content: "VibeCoding KZ аккаунтыңа кір: жобаларың мен сақталған промпттарың сені күтіп тұр.",
      },
      { property: "og:title", content: "Кіру — VibeCoding KZ" },
      { property: "og:description", content: "VibeCoding KZ workspace-ке кір." },
    ],
  }),
  component: LoginPage,
});

function safePath(value?: string) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/projects";
}

function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const target = safePath(search.redirect);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);
    if (err) {
      setError(
        err.message.toLowerCase().includes("invalid")
          ? "Email немесе құпиясөз дұрыс емес."
          : err.message,
      );
      return;
    }
    void navigate({ to: target, replace: true });
  };

  return (
    <AuthShell
      title="Қайта қош келдің."
      subtitle="VibeCoding KZ workspace-ке кір."
      footer={
        <>
          Аккаунтың жоқ па?{" "}
          <Link
            to="/signup"
            search={{ redirect: search.redirect }}
            className="font-semibold text-primary-glow hover:underline"
          >
            Тіркел
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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

        {error ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin" /> : null}
          {submitting ? "Кіріп жатырмыз..." : "Кіру"}
        </Button>
      </form>
    </AuthShell>
  );
}
