import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreditCard, Gauge, Loader2, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Профиль — VibeCoding KZ аккаунтым" },
      {
        name: "description",
        content: "VibeCoding KZ аккаунтың: email, тіркелген күні, тариф және қолданыс.",
      },
      { property: "og:title", content: "Профиль — VibeCoding KZ" },
      { property: "og:description", content: "Аккаунт мәліметтерің бір бетте." },
    ],
  }),
  component: ProfilePage,
});

interface ProfileRow {
  display_name: string | null;
  email: string | null;
  created_at: string;
}

function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [dbLoading, setDbLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/login", search: { redirect: "/profile" }, replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setDbLoading(true);
    supabase
      .from("profiles")
      .select("display_name, email, created_at")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setDbError("Профиль жүктелмеді.");
        else setProfile(data as ProfileRow | null);
        setDbLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const email = profile?.email ?? user.email ?? "";
  const initial = (profile?.display_name ?? email ?? "?").charAt(0).toUpperCase();
  const created = profile?.created_at ?? user.created_at;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Шықтың");
    void navigate({ to: "/", replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <PageHeader eyebrow="Аккаунт" title="Менің профилім" description="Аккаунт мәліметтерің." />

      <div className="surface-card animate-rise rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[image:var(--gradient-primary)] text-2xl font-bold text-primary-foreground">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{profile?.display_name ?? "VibeCoder"}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
            {dbLoading ? (
              <p className="mt-1 text-xs text-muted-foreground">Жүктелуде...</p>
            ) : created ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Тіркелген: {new Date(created).toLocaleDateString("kk-KZ")}
              </p>
            ) : null}
          </div>
        </div>
        {dbError ? <p className="mt-4 text-xs text-destructive">{dbError}</p> : null}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {[
          { icon: CreditCard, label: "Тариф", value: "Free" },
          { icon: Sparkles, label: "Кредиттер", value: "Жақында" },
          { icon: Gauge, label: "Қолданыс", value: "Жақында" },
        ].map((item, i) => (
          <div
            key={item.label}
            style={{ animationDelay: `${i * 60}ms` }}
            className="surface-card card-interactive animate-rise rounded-3xl p-5"
          >
            <item.icon className="size-5 text-primary-glow" />
            <p className="mt-3 text-xs text-muted-foreground">{item.label}</p>
            <p className="text-base font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Button variant="glass" size="lg" onClick={handleSignOut}>
          <LogOut /> Шығу
        </Button>
      </div>
    </div>
  );
}
