"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/_lib/supabase";
import { clearActorCache } from "@/_lib/admin/audit";
import type { AdminUser } from "@/_lib/admin/types";

type AdminAuthValue = {
  session: Session | null;
  admin: AdminUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  // Tracks which user we've already resolved, so tab-refocus re-emits of
  // SIGNED_IN don't re-query or flash the loader.
  const resolvedUser = useRef<string | null>(null);

  const loadAdmin = useCallback(async (s: Session | null) => {
    if (!s?.user) {
      setAdmin(null);
      resolvedUser.current = null;
      return;
    }
    const { data } = await supabase
      .from("admin_users")
      .select("*")
      .eq("id", s.user.id)
      .maybeSingle();
    setAdmin((data as AdminUser | null) ?? null);
    resolvedUser.current = s.user.id;
  }, []);

  useEffect(() => {
    let active = true;
    // Initial bootstrap runs OUTSIDE the auth callback, so querying here is safe.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      await loadAdmin(data.session);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (!active) return;
      setSession(s);
      // Token refreshes / user updates don't change admin status.
      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED") return;
      if (event === "SIGNED_OUT") {
        setAdmin(null);
        resolvedUser.current = null;
        clearActorCache();
        setLoading(false);
        return;
      }
      // SIGNED_IN / INITIAL_SESSION. Returning to the tab re-emits SIGNED_IN for
      // the same user — skip the re-check (and the loader) in that case.
      const uid = s?.user?.id ?? null;
      if (uid && uid === resolvedUser.current) return;
      setLoading(true);
      // CRITICAL: defer Supabase calls out of the auth callback. supabase-js
      // holds an internal lock while this callback runs; a query here would
      // await getSession() on the same lock and deadlock (this is what froze
      // the guard's spinner forever when coming back to the tab).
      setTimeout(() => {
        if (!active) return;
        loadAdmin(s).finally(() => {
          if (active) setLoading(false);
        });
      }, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadAdmin]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    clearActorCache();
    setSession(null);
    setAdmin(null);
  }, []);

  const refresh = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await loadAdmin(data.session);
  }, [loadAdmin]);

  return (
    <AdminAuthContext.Provider value={{ session, admin, loading, signOut, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
