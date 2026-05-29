"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/_lib/supabase";
import { touchLastLogin } from "@/_lib/admin/admin-users";
import { useAdminAuth } from "@/_components/admin/auth-provider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, admin, loading: authLoading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && session && admin?.is_active) {
      router.replace("/admin/dashboard");
    }
  }, [authLoading, session, admin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.user) {
      setError("Identifiants invalides.");
      setLoading(false);
      return;
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id, is_active")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!adminRow || !adminRow.is_active) {
      await supabase.auth.signOut();
      setError("Ce compte n'a pas accès à l'administration.");
      setLoading(false);
      return;
    }

    await touchLastLogin(data.user.id);
    router.replace("/admin/dashboard");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-secondary/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl tracking-tight">
            <span className="font-medium">Quick</span>fund
          </Link>
          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-brand-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> Espace administration
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background p-8 shadow-overlay">
          <h1 className="font-serif text-2xl tracking-tight">Connexion</h1>
          <p className="mt-1 text-sm text-muted-foreground">Accès réservé à l&apos;équipe Quickfund.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="vous@quickfund.fr"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
                placeholder="••••••••"
              />
            </div>

            {error ? (
              <p className="rounded-md border border-error/25 bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Se connecter
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
