"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAdminAuth } from "./auth-provider";

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">{children}</div>
  );
}

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { session, admin, loading, signOut } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) router.replace("/admin/login");
  }, [loading, session, router]);

  if (loading || !session) {
    return (
      <FullScreen>
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </FullScreen>
    );
  }

  if (!admin || !admin.is_active) {
    return (
      <FullScreen>
        <div className="max-w-sm rounded-lg border border-border bg-background p-8 text-center shadow-overlay">
          <ShieldAlert className="mx-auto h-8 w-8 text-error" />
          <h1 className="mt-4 text-lg font-semibold tracking-tight">Accès refusé</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ce compte n&apos;a pas accès à l&apos;espace d&apos;administration.
          </p>
          <button
            onClick={() => signOut().then(() => router.replace("/admin/login"))}
            className="mt-6 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Se déconnecter
          </button>
        </div>
      </FullScreen>
    );
  }

  return <>{children}</>;
}
