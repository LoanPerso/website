"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/_lib/utils";
import { adminNavGroups } from "./nav";
import { useAdminAuth } from "./auth-provider";
import { ThemeToggle } from "./theme-toggle";

const COLLAPSE_KEY = "admin:sidebar-collapsed";

function NavList({ collapsed, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5">
      {adminNavGroups.map((group, gi) => (
        <div key={group.label ?? `group-${gi}`} className="flex flex-col gap-0.5">
          {group.label && !collapsed ? (
            <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/60">
              {group.label}
            </p>
          ) : null}
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "group flex items-center rounded-md text-[13px] transition-colors",
                  collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-3 py-1.5",
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4 shrink-0", active ? "text-foreground" : "text-muted-foreground")} />
                {!collapsed ? item.label : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const { admin, signOut } = useAdminAuth();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2", collapsed ? "flex-col" : "justify-between px-1")}>
        <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-2 py-1" title="Quickfund Admin">
          {collapsed ? (
            <span className="font-serif text-xl font-medium tracking-tight">Q</span>
          ) : (
            <>
              <span className="font-serif text-xl tracking-tight">
                <span className="font-medium">Quick</span>fund
              </span>
              <span className="rounded bg-brand-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-gold">
                Admin
              </span>
            </>
          )}
        </Link>
        {onToggle ? (
          <button
            onClick={onToggle}
            title={collapsed ? "Déployer la barre latérale" : "Réduire la barre latérale"}
            aria-label={collapsed ? "Déployer la barre latérale" : "Réduire la barre latérale"}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <div className="mt-8 flex-1 overflow-y-auto overscroll-contain">
        <NavList collapsed={collapsed} onNavigate={onNavigate} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => signOut().then(() => router.replace("/admin/login"))}
              title="Déconnexion"
              aria-label="Déconnexion"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 px-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-muted-foreground" title={admin?.email}>
                  {admin?.full_name || admin?.email}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{admin?.role}</p>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={() => signOut().then(() => router.replace("/admin/login"))}
              className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the persisted collapse state (client-only; avoids SSR hydration drift).
  useEffect(() => {
    setCollapsed(typeof window !== "undefined" && window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }

  // Lock background scroll while the mobile drawer is open (native-app feel).
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // `--sidebar-w` drives the desktop sidebar width, the main padding and any
  // full-bleed page pinned to the right of it (mail, mailbox accounts).
  return (
    <div className="min-h-dvh" style={{ "--sidebar-w": collapsed ? "3.5rem" : "15rem" } as React.CSSProperties}>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 hidden border-r border-border bg-secondary/30 transition-[width,padding] lg:block lg:w-[var(--sidebar-w)]",
          collapsed ? "lg:p-2" : "p-4"
        )}
      >
        <SidebarContent collapsed={collapsed} onToggle={toggleCollapsed} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-serif text-lg">
          <span className="font-medium">Quick</span>fund <span className="text-xs text-brand-gold">Admin</span>
        </span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-8 w-8 items-center justify-center text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer (always expanded) */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-deep-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-background p-4 shadow-overlay">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="transition-[padding] lg:pl-[var(--sidebar-w)]">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
