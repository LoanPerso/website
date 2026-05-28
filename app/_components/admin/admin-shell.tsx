"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/_lib/utils";
import { adminNavGroups } from "./nav";
import { useAdminAuth } from "./auth-provider";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5">
      {adminNavGroups.map((group, gi) => (
        <div key={group.label ?? `group-${gi}`} className="flex flex-col gap-1">
          {group.label ? (
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
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-4 w-4", active ? "text-accent" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { admin, signOut } = useAdminAuth();
  const router = useRouter();

  return (
    <div className="flex h-full flex-col">
      <Link href="/admin/dashboard" onClick={onNavigate} className="flex items-center gap-2 px-3 py-1">
        <span className="font-serif text-xl tracking-tight">
          <span className="font-medium">Quick</span>fund
        </span>
        <span className="rounded-sm bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-dark-gold">
          Admin
        </span>
      </Link>

      <div className="mt-8 flex-1 overflow-y-auto">
        <NavList onNavigate={onNavigate} />
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="truncate px-3 text-xs text-muted-foreground" title={admin?.email}>
          {admin?.full_name || admin?.email}
        </p>
        <p className="px-3 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {admin?.role}
        </p>
        <button
          onClick={() => signOut().then(() => router.replace("/admin/login"))}
          className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-secondary/30 p-5 lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="font-serif text-lg">
          <span className="font-medium">Quick</span>fund <span className="text-xs text-dark-gold">Admin</span>
        </span>
        <button onClick={() => setOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-deep-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-background p-5 shadow-xl">
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

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
